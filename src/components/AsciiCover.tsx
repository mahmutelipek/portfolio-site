import { Ascii } from 'ascii.rest/react';
import * as earthrise from 'ascii.rest/pieces/earthrise';
import './Frame.css';

// The scene drifts slowly, so a low frame rate looks the same and costs far less CPU.
const FPS = 8;

/**
 * Low animated cover above the intro: the "earthrise" piece from ascii.rest (MIT, @bas3line).
 * The piece is 2:1, so only a band of it is shown; see `.ascii-cover canvas` in Frame.css.
 */
export default function AsciiCover() {
  return (
    <div className="ascii-cover" aria-hidden="true">
      <Ascii piece={earthrise} options={{ fps: FPS }} label="Animated ASCII earth rising over the lunar horizon" />
    </div>
  );
}
