import type { SyntheticEvent } from 'react';
import { SITE_URL } from './useDocumentTitle';

// Supabase Storage serves originals from /object/public/ and resized copies
// from /render/image/public/ (image transformations).
const OBJECT_PATH = '/storage/v1/object/public/';
const RENDER_PATH = '/storage/v1/render/image/public/';

// Covers served from this site (public/covers): <name>.webp is the 1600px file and <name>-800.webp
// the small one.
const LOCAL_IMAGE = /^(\/covers)\/([\w-]+)\.webp$/;

function canTransform(url: string): boolean {
  return url.includes(OBJECT_PATH) && !/\.(svg|gif)(\?|$)/i.test(url);
}

// `resize=contain` is required: with only `width`, Supabase keeps the original height
// and crops ("cover"), which distorts the aspect ratio. `contain` scales proportionally.
function resized(url: string, width: number, quality: number): string {
  return `${url.replace(OBJECT_PATH, RENDER_PATH)}?width=${width}&quality=${quality}&resize=contain`;
}

/**
 * Returns `src` and `srcSet` for a Supabase-hosted image so the browser picks a
 * right-sized copy. Other URLs (data URIs, external hosts, svg/gif) are
 * returned unchanged.
 */
export function responsiveImage(url: string, widths: number[] = [800, 1400], quality = 90) {
  const local = LOCAL_IMAGE.exec(url);
  if (local) {
    const small = `${local[1]}/${local[2]}-800.webp`;
    return { src: small, srcSet: `${small} 800w, ${url} 1600w` };
  }
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

/** URL for the social share image (Open Graph / Twitter): a 1200px-wide copy for Supabase images. */
export function shareImage(url: string): string {
  if (url.startsWith('/')) return `${SITE_URL}${url}`; // Open Graph needs an absolute address
  return url && canTransform(url) ? resized(url, 1200, 80) : url;
}

const warmed = new Set<string>();

/**
 * Starts downloading an image into the browser cache ahead of time. `sizes` must match
 * the real <img> so the browser picks the same srcset candidate and the later request is a cache hit.
 */
export function warmImage(url: string, sizes: string): void {
  if (!url || warmed.has(url)) return;
  warmed.add(url);
  const img = new Image();
  const { src, srcSet } = responsiveImage(url);
  if (srcSet) img.srcset = srcSet;
  img.sizes = sizes;
  img.decoding = 'async';
  img.src = src;
}
