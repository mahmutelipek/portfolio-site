import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { responsiveImage, fallbackToOriginal } from '../lib/image';

// Project media is authored at 1280x768. The box keeps that ratio and the media is
// fitted inside it with `contain`, so nothing is cropped or stretched.
const RATIO = '1280 / 768';

/** `sizes` for media inside the 720px column (shared so prefetching picks the same srcset candidate). */
export const COLUMN_SIZES = '(max-width: 720px) 100vw, 672px';

interface FitImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** Load immediately (above the fold) instead of lazily. */
  priority?: boolean;
  /** When set, the box is a button that opens the media full-screen. */
  onOpen?: () => void;
}

/**
 * "Click to zoom" label that follows the mouse over its parent box (fine pointers only; the CSS
 * hides it on touch). The pointer is tracked on the window and re-checked on scroll too, because a
 * page that scrolls under a still cursor fires no pointer events: otherwise the label would ride
 * along with the image instead of staying under the cursor. Position is written straight to the
 * element, once per frame.
 */
function ZoomPill() {
  const pill = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = pill.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;

    const sync = () => {
      frame = 0;
      const r = box.getBoundingClientRect();
      const inside =
        pointer !== null &&
        pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom &&
        // something else (header, lightbox) may be on top of the box at that point
        box.contains(document.elementFromPoint(pointer.x, pointer.y));
      if (!inside || !pointer) {
        el.classList.remove('on');
        return;
      }
      const halfW = el.offsetWidth / 2 + 8;
      const halfH = el.offsetHeight / 2 + 8;
      el.style.left = `${Math.min(Math.max(pointer.x - r.left, halfW), r.width - halfW)}px`;
      el.style.top = `${Math.min(Math.max(pointer.y - r.top, halfH), r.height - halfH)}px`;
      el.classList.add('on');
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };

    const move = (e: PointerEvent) => {
      pointer = e.pointerType === 'mouse' ? { x: e.clientX, y: e.clientY } : null;
      schedule();
    };
    const gone = () => { pointer = null; schedule(); };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    document.documentElement.addEventListener('pointerleave', gone);
    window.addEventListener('blur', gone);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', schedule);
      document.documentElement.removeEventListener('pointerleave', gone);
      window.removeEventListener('blur', gone);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <span ref={pill} className="zoom-pill" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5" />
      </svg>
      Click to zoom
    </span>
  );
}

/** Props that make a media box act as a keyboard-reachable "click to zoom" button. */
function zoomable(className: string | undefined, label: string, onOpen?: () => void) {
  if (!onOpen) return { className };
  return {
    className: `${className ?? ''} zoomable`.trim(),
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': label,
    onClick: onOpen,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpen();
      }
    },
  };
}

export function FitImage({ src, alt, sizes, className, priority = false, onOpen }: FitImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div {...zoomable(className, `Enlarge: ${alt}`, onOpen)} style={{ aspectRatio: RATIO, background: 'rgba(255, 255, 255, 0.03)' }}>
      <img
        className="fit-img"
        {...responsiveImage(src)}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        ref={img => { if (img?.complete && img.naturalWidth) setLoaded(true); }}
        onLoad={() => setLoaded(true)}
        onError={fallbackToOriginal(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          opacity: loaded ? 1 : 0,
        }}
      />
      {onOpen && <ZoomPill />}
    </div>
  );
}

/**
 * Videos fill the same 1280 x 768 box as the images. A clip with another shape (16:9, say) is scaled to
 * cover the box, so there are no bars; only a sliver of its edges is trimmed.
 */
export function FitVideo({ src, className, onOpen }: { src: string; className?: string; onOpen?: () => void }) {
  return (
    <div {...zoomable(className, 'Enlarge video', onOpen)} style={{ aspectRatio: RATIO }}>
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {onOpen && <ZoomPill />}
    </div>
  );
}
