import { useRef } from 'react';
import Lottie from 'lottie-react';
import type { LottieRefCurrentProps } from 'lottie-react';
import loadingAnimation from '../../loading.json';

// Kept in its own file so the (large) Lottie runtime is loaded as a separate chunk.
//
// The artwork is pure white painted on an opaque black square. The SVG filter below turns
// luminance into alpha (black -> transparent, white -> white) so the glass overlay behind
// the animation shows through instead of a black box.
//
// The filter is set as an attribute on the SVG's own group rather than through the CSS
// `filter` property: Safari does not reliably apply `filter: url(#id)` to HTML elements,
// but it does support the SVG `filter` attribute on SVG elements.
const FILTER_ID = 'luma-to-alpha';

export default function SplashLottie() {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const applyFilter = () => {
    const root = lottieRef.current?.animationContainerRef.current;
    root?.querySelectorAll(':scope > svg > g').forEach(g => g.setAttribute('filter', `url(#${FILTER_ID})`));
  };

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <filter id={FILTER_ID} colorInterpolationFilters="sRGB">
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
        lottieRef={lottieRef}
        onDOMLoaded={applyFilter}
        animationData={loadingAnimation}
        loop
        style={{ position: 'absolute', inset: 0, zIndex: 1, width: '100%', height: '100%' }}
      />
    </>
  );
}
