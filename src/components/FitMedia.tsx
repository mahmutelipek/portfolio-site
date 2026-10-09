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
    </div>
  );
}

/**
 * Videos start in the 1280 x 768 box and switch to their own ratio once it is known, so a 16:9 clip
 * fills its box with no bars (images keep the fixed box and are fitted inside it).
 */
export function FitVideo({ src, className }: { src: string; className?: string }) {
  const [ratio, setRatio] = useState(RATIO);
  return (
    <div className={className} style={{ aspectRatio: ratio }}>
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={e => {
          const { videoWidth: w, videoHeight: h } = e.currentTarget;
          if (w && h) setRatio(`${w} / ${h}`);
        }}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}
