import { useState } from 'react';
import type { CSSProperties } from 'react';
import { responsiveImage, fallbackToOriginal } from '../lib/image';

// Placeholder ratio used until the real size of the media is known.
const DEFAULT_RATIO = '16 / 10';

interface FitImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** Load immediately (above the fold) instead of lazily. */
  priority?: boolean;
}

/** Shows an image at its own aspect ratio instead of cropping it to a fixed box. */
export function FitImage({ src, alt, sizes, className, priority = false }: FitImageProps) {
  const [ratio, setRatio] = useState<string>(DEFAULT_RATIO);
  const style: CSSProperties = { aspectRatio: ratio };

  return (
    <div className={className} style={style}>
      <img
        {...responsiveImage(src)}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={e => {
          const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
          if (w && h) setRatio(`${w} / ${h}`);
        }}
        onError={fallbackToOriginal(src)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}

/** Same idea for autoplaying videos. */
export function FitVideo({ src, className }: { src: string; className?: string }) {
  const [ratio, setRatio] = useState<string>('16 / 9');

  return (
    <div className={className} style={{ aspectRatio: ratio }}>
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        onLoadedMetadata={e => {
          const { videoWidth: w, videoHeight: h } = e.currentTarget;
          if (w && h) setRatio(`${w} / ${h}`);
        }}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}
