import { useState } from 'react';
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
}

export function FitImage({ src, alt, sizes, className, priority = false }: FitImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={className} style={{ aspectRatio: RATIO, background: 'rgba(255, 255, 255, 0.03)' }}>
      <img
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
          transition: 'opacity 0.35s ease',
        }}
      />
    </div>
  );
}

export function FitVideo({ src, className }: { src: string; className?: string }) {
  return (
    <div className={className} style={{ aspectRatio: RATIO }}>
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}
