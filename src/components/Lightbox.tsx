import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLenis } from 'lenis/react';

export interface LightboxItem {
  type: 'image' | 'video';
  src: string;
}

interface LightboxProps {
  /** The media to enlarge, or null when closed. */
  item: LightboxItem | null;
  onClose: () => void;
}

/**
 * Click-to-zoom viewer for one image or video. It shows the original file, not the resized,
 * re-compressed copies used in the page, since the point of zooming is detail. Esc, the backdrop
 * and the close button dismiss it.
 */
export default function Lightbox({ item, onClose }: LightboxProps) {
  const lenis = useLenis();
  const open = item !== null;
  const closeRef = useRef<HTMLButtonElement>(null);
  /** The element to hand focus back to on close; set only when it was opened with the keyboard. */
  const returnTo = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  // Page scroll is locked while open; focus moves into the dialog and returns on close.
  useEffect(() => {
    if (!open) return;
    // After a mouse click the opener must not get focus back, or it shows a focus ring on the image.
    const opener = document.activeElement as HTMLElement | null;
    returnTo.current = opener?.matches(':focus-visible') ? opener : null;
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lenis?.start();
      document.documentElement.style.overflow = '';
      returnTo.current?.focus?.();
    };
  }, [open, lenis]);

  return (
    <AnimatePresence>
      {item && (
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
          onClick={onClose}
        >
          <motion.div
            className="lightbox-media"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
            onClick={e => { e.stopPropagation(); onClose(); }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
