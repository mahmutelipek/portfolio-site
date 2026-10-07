import type { SyntheticEvent } from 'react';

// Supabase Storage serves originals from /object/public/ and resized copies
// from /render/image/public/ (image transformations).
const OBJECT_PATH = '/storage/v1/object/public/';
const RENDER_PATH = '/storage/v1/render/image/public/';

function canTransform(url: string): boolean {
  return url.includes(OBJECT_PATH) && !/\.(svg|gif)(\?|$)/i.test(url);
}

function resized(url: string, width: number, quality: number): string {
  return `${url.replace(OBJECT_PATH, RENDER_PATH)}?width=${width}&quality=${quality}`;
}

/**
 * Returns `src` and `srcSet` for a Supabase-hosted image so the browser picks a
 * right-sized copy. Other URLs (data URIs, external hosts, svg/gif) are
 * returned unchanged.
 */
export function responsiveImage(url: string, widths: number[] = [700, 1400], quality = 75) {
  if (!url || !canTransform(url)) return { src: url, srcSet: undefined };
  const sorted = [...widths].sort((a, b) => a - b);
  return {
    src: resized(url, sorted[0], quality),
    srcSet: sorted.map(w => `${resized(url, w, quality)} ${w}w`).join(', '),
  };
}

/** onError handler: if a resized copy fails to load, fall back to the original once. */
export function fallbackToOriginal(original: string) {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fallback) return;
    img.dataset.fallback = '1';
    img.removeAttribute('srcset');
    img.src = original;
  };
}
