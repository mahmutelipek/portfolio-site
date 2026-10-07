import { responsiveImage, fallbackToOriginal } from '../lib/image';

// Project media is authored at 1280x768. The box keeps that ratio and the media is
// fitted inside it with `contain`, so nothing is cropped or stretched.
const RATIO = '1280 / 768';

interface FitImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** Load immediately (above the fold) instead of lazily. */
  priority?: boolean;
}

export function FitImage({ src, alt, sizes, className, priority = false }: FitImageProps) {
  return (
    <div className={className} style={{ aspectRatio: RATIO }}>
      <img
        {...responsiveImage(src)}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onError={fallbackToOriginal(src)}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
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
