/** Runs `fn` once the page has finished loading and the browser is idle (or after `timeout` ms). */
export function whenIdle(fn: () => void, timeout = 2000): () => void {
  let cancelled = false;
  let handle = 0;
  const run = () => {
    if (cancelled) return;
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) handle = ric(() => !cancelled && fn(), { timeout });
    else handle = window.setTimeout(() => !cancelled && fn(), 200);
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener('load', run);
    const cic = (window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
    if (cic) cic(handle); else clearTimeout(handle);
  };
}
