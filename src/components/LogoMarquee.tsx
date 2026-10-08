import type { Logo } from '../lib/types';
import './Frame.css';

interface LogoMarqueeProps {
  logos: Logo[];
}

/** Slowly scrolling strip of the logos managed in the admin ("Teams (Logos)" tab). */
export function LogoMarquee({ logos }: LogoMarqueeProps) {
  const items = logos.filter(l => l.url);
  if (items.length === 0) return null;

  const group = (hidden: boolean) => (
    <ul className={hidden ? 'logo-group logo-dup' : 'logo-group'} aria-hidden={hidden || undefined}>
      {items.map(logo => (
        <li key={logo.id} className="logo-item">
          <img src={logo.url} alt={hidden ? '' : logo.name} width={148} height={148} decoding="async" draggable={false} />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="frame">
      <style>{`
        .logo-strip {
          position: relative;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
        }
        .logo-track {
          display: flex;
          width: max-content;
          animation: logo-scroll 60s linear infinite;
        }
        .logo-strip:hover .logo-track { animation-play-state: paused; }
        .logo-group { display: flex; flex: none; list-style: none; }
        .logo-item {
          position: relative;
          flex: none;
          width: 124px;
          height: 64px;
        }
        /* Logos sit small on a 512px canvas with transparent padding, so the canvas is drawn
           larger than the cell and neighbouring canvases overlap where they are empty. */
        .logo-item img {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 148px;
          height: 148px;
          max-width: none;
          transform: translate(-50%, -50%);
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
          .logo-group { flex-wrap: wrap; justify-content: center; }
          .logo-dup { display: none; }
          .logo-strip { -webkit-mask-image: none; mask-image: none; }
        }
      `}</style>
      <h2 className="section-title">Worked with</h2>
      <div className="logo-strip rule-top" style={{ position: 'relative' }}>
        <div className="logo-track">
          {group(false)}
          {group(true)}
        </div>
      </div>
    </div>
  );
}
