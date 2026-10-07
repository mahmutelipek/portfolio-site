import Lottie from 'lottie-react';
import loadingAnimation from '../../loading.json';

// Kept in its own file so the (large) Lottie runtime is loaded as a separate chunk.
//
// The artwork is pure white painted on an opaque black square. The SVG filter below
// turns luminance into alpha (black -> transparent, white -> white) so the glass
// overlay behind the animation shows through instead of a black box.
export default function SplashLottie() {
  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <filter id="luma-to-alpha" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0.299 0.587 0.114 0 0"
          />
        </filter>
      </svg>
      <Lottie
        animationData={loadingAnimation}
        loop
        style={{ position: 'absolute', inset: 0, zIndex: 1, width: '100%', height: '100%', filter: 'url(#luma-to-alpha)' }}
      />
    </>
  );
}
