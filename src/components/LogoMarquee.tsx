import { useEffect, useState } from 'react';
import type { Logo } from '../lib/types';
import { measureLogo, type LogoBox } from '../lib/logoMetrics';
import './Frame.css';

interface LogoMarqueeProps {
  logos: Logo[];
}

// Every logo is scaled so it carries about the same visual weight: its content box area
// is weighted by how much of that box is ink, so a bold wordmark ends up smaller than a
// fine-lined one of the same width. Sizes are then clamped, and the gap is the same everywhere.
const TARGET_WEIGHT = 560;
const DENSITY_POWER = 0.85;
const DENSITY_CAP = 0.55; // solid blobs stop shrinking here, so their small details stay readable
const MAX_W = 108;
const MAX_H = 38;
const GAP = 44;
const STRIP_H = 68;
const WHOLE_CANVAS: LogoBox = { x0: 0, y0: 0, x1: 1, y1: 1, density: 0.3, invert: false };

interface Placed {
  logo: Logo;
  w: number;
  h: number;
  /** Size of the full canvas when the content fills w x h, and where the content starts. */
  canvas: number;
  left: number;
  top: number;
  invert: boolean;
}

function place(logo: Logo, box: LogoBox | null): Placed {
  const b = box ?? WHOLE_CANVAS;
  const fw = b.x1 - b.x0;
  const fh = b.y1 - b.y0;
  // Content size at scale 1 is (fw, fh) canvas fractions; find the scale for the target weight.
  let k = Math.sqrt(TARGET_WEIGHT / (fw * fh * Math.pow(Math.min(b.density, DENSITY_CAP), DENSITY_POWER)));
  k = Math.min(k, MAX_W / fw, MAX_H / fh);
  if (!box) k = 44; // measurement failed: show the whole canvas at a modest fixed size
  return { logo, w: fw * k, h: fh * k, canvas: k, left: -b.x0 * k, top: -b.y0 * k, invert: b.invert };
}

/** Slowly scrolling strip of the logos managed in the admin ("Teams (Logos)" tab). */
export function LogoMarquee({ logos }: LogoMarqueeProps) {
  const [placed, setPlaced] = useState<Placed[] | null>(null);
  const urls = logos.filter(l => l.url);
  const key = urls.map(l => l.id + l.url).join('|');

  useEffect(() => {
    let live = true;
    Promise.all(urls.map(l => measureLogo(l.url))).then(boxes => {
      if (live) setPlaced(urls.map((l, i) => place(l, boxes[i])));
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (urls.length === 0) return null;

  const group = (hidden: boolean) => (
    <ul className={hidden ? 'logo-group logo-dup' : 'logo-group'} aria-hidden={hidden || undefined}>
      {(placed ?? []).map(p => (
        <li key={p.logo.id} className="logo-item" style={{ width: p.w, height: p.h }}>
          <img
            src={p.logo.url}
            alt={hidden ? '' : p.logo.name}
            width={p.canvas}
            height={p.canvas}
            crossOrigin="anonymous"
            onError={e => {
              // A host without CORS headers: show the logo anyway, just without measuring it.
              const img = e.currentTarget;
              if (img.crossOrigin) {
                img.removeAttribute('crossorigin');
                img.src = p.logo.url;
              }
            }}
            decoding="async"
            draggable={false}
            style={{ width: p.canvas, height: p.canvas, left: p.left, top: p.top, filter: p.invert ? 'invert(1)' : undefined }}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="frame">
      <style>{`
        .logo-strip {
          position: relative;
          height: ${STRIP_H}px;
        }
        /* The edge fade lives on the scrolling area only, so the strip's top border stays whole. */
        .logo-viewport {
          height: 100%;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
        }
        .logo-track {
          display: flex;
          align-items: center;
          height: 100%;
          width: max-content;
          opacity: 0;
          transition: opacity 0.4s ease;
          animation: logo-scroll 70s linear infinite;
        }
        .logo-track.ready { opacity: 1; }
        .logo-strip:hover .logo-track { animation-play-state: paused; }
        .logo-group { display: flex; align-items: center; flex: none; list-style: none; }
        .logo-item {
          position: relative;
          flex: none;
          margin-right: ${GAP}px;
          overflow: hidden;
        }
        .logo-item img {
          position: absolute;
          max-width: none;
          opacity: 0.65;
          transition: opacity 0.2s ease;
          user-select: none;
        }
        .logo-item:hover img { opacity: 1; }
        @keyframes logo-scroll {
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-track { animation: none; width: 100%; }
          .logo-group { flex: 1 1 auto; min-width: 0; flex-wrap: wrap; justify-content: center; row-gap: 20px; padding-left: ${GAP / 2}px; }
          .logo-dup { display: none; }
          .logo-strip { height: auto; }
          .logo-viewport { padding: 24px 0; -webkit-mask-image: none; mask-image: none; }
        }
      `}</style>
      <h2 className="section-title">Worked with</h2>
      <div className="logo-strip rule-top">
        <div className="logo-viewport">
          <div className={placed ? 'logo-track ready' : 'logo-track'}>
            {group(false)}
            {group(true)}
          </div>
        </div>
      </div>
    </div>
  );
}
