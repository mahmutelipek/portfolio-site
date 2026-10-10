import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLenis } from 'lenis/react';

export interface LightboxItem {
  type: 'image' | 'video';
  src: string;
}

interface LightboxProps {
  items: LightboxItem[];
  /** Index of the open item, or null when closed. */
  index: number | null;
  onChange: (index: number | null) => void;
}

const SWIPE_DISTANCE = 60;

/**
 * Click-to-zoom viewer for project media. It shows the original file, not the resized, re-compressed
 * copies used in the page, since the point of zooming is detail. Esc / backdrop / button close;
 * arrows or swipe to browse.
 */
export default function Lightbox({ items, index, onChange }: LightboxProps) {
  const lenis = useLenis();
  const open = index !== null && items[index] !== undefined;
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const go = useCallback(
    (to: number) => onChange((to + items.length) % items.length),
    [items.length, onChange],
  );

  // Page scroll is locked while open; focus moves into the dialog and returns on close.
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = '';
      opener.current?.focus?.();
    };
  }, [open, lenis]);

  useEffect(() => {
    if (!open || index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null);
      else if (items.length > 1 && e.key === 'ArrowRight') go(index + 1);
      else if (items.length > 1 && e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, items.length, go, onChange]);

  // Warm the neighbours so browsing feels instant.
  useEffect(() => {
    if (!open || index === null || items.length < 2) return;
    [index - 1, index + 1].forEach(i => {
      const item = items[(i + items.length) % items.length];
      if (item.type === 'image') new Image().src = item.src;
    });
  }, [open, index, items]);

  const item = open && index !== null ? items[index] : null;
  const many = items.length > 1;

  return (
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged project media"
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={() => onChange(null)}
        >
          <motion.div
            key={index}
            className="lightbox-media"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            drag={many ? 'x' : false}
            dragSnapToOrigin
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x <= -SWIPE_DISTANCE) go(index + 1);
              else if (info.offset.x >= SWIPE_DISTANCE) go(index - 1);
            }}
            onClick={e => e.stopPropagation()}
          >
            {item.type === 'image' ? (
              <img src={item.src} alt="Project visual" draggable={false} />
            ) : (
              <video src={item.src} autoPlay loop muted playsInline controls />
            )}
          </motion.div>

          <button
            ref={closeRef}
            type="button"
            className="lightbox-btn lightbox-close"
            aria-label="Close"
            onClick={e => { e.stopPropagation(); onChange(null); }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>

          {many && (
            <>
              <button
                type="button"
                className="lightbox-btn lightbox-prev"
                aria-label="Previous"
                onClick={e => { e.stopPropagation(); go(index - 1); }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 3L5 8l5 5" />
                </svg>
              </button>
              <button
                type="button"
                className="lightbox-btn lightbox-next"
                aria-label="Next"
                onClick={e => { e.stopPropagation(); go(index + 1); }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </button>
              <div className="lightbox-count" aria-live="polite">{index + 1} / {items.length}</div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
