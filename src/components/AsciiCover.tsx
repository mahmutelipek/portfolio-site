import { Ascii } from 'ascii.rest/react';
import * as kyotoDusk from 'ascii.rest/pieces/kyoto-dusk';
import './Frame.css';

/**
 * Low animated cover above the intro: the "kyoto dusk" piece from ascii.rest (MIT, @bas3line).
 * The piece is 2:1, so only a band of it is shown; see `.ascii-cover canvas` in Frame.css.
 */
export default function AsciiCover() {
  return (
    <div className="ascii-cover" aria-hidden="true">
      <Ascii piece={kyotoDusk} label="Animated ASCII pagoda at dusk" />
    </div>
  );
}
