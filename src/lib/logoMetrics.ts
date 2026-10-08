// Logos are uploaded on 512px canvases with uneven transparent padding, so their raw
// sizes say little about how big they look. These helpers measure the visible content.

export interface LogoBox {
  /** Visible content as fractions of the canvas (0 to 1). */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const SCAN = 256;
const ALPHA_MIN = 12;
const cache = new Map<string, Promise<LogoBox | null>>();

function measure(url: string): Promise<LogoBox | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = SCAN;
        canvas.height = SCAN;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, SCAN, SCAN);
        const { data } = ctx.getImageData(0, 0, SCAN, SCAN);
        let x0 = SCAN, y0 = SCAN, x1 = -1, y1 = -1;
        for (let y = 0; y < SCAN; y++) {
          for (let x = 0; x < SCAN; x++) {
            if (data[(y * SCAN + x) * 4 + 3] > ALPHA_MIN) {
              if (x < x0) x0 = x;
              if (x > x1) x1 = x;
              if (y < y0) y0 = y;
              if (y > y1) y1 = y;
            }
          }
        }
        if (x1 < 0) return resolve(null);
        // One pixel of slack so antialiased edges are not clipped.
        resolve({
          x0: Math.max(0, x0 - 1) / SCAN,
          y0: Math.max(0, y0 - 1) / SCAN,
          x1: Math.min(SCAN, x1 + 2) / SCAN,
          y1: Math.min(SCAN, y1 + 2) / SCAN,
        });
      } catch {
        resolve(null); // canvas tainted or unreadable: caller falls back to the whole canvas
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function measureLogo(url: string): Promise<LogoBox | null> {
  let hit = cache.get(url);
  if (!hit) {
    hit = measure(url);
    cache.set(url, hit);
  }
  return hit;
}
