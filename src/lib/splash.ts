// The opening animation plays once per visitor per day, not on every page load.
const KEY = 'splash-seen-at';
const DAY_MS = 24 * 60 * 60 * 1000;

/** True when this browser already saw the splash in the last 24 hours. Add ?splash to the URL to force it. */
export function hasSeenSplash(): boolean {
  try {
    if (new URLSearchParams(window.location.search).has('splash')) return false;
    const at = Number(localStorage.getItem(KEY));
    return Number.isFinite(at) && at > 0 && Date.now() - at < DAY_MS;
  } catch {
    return false;
  }
}

export function markSplashSeen(): void {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    // storage unavailable (private mode etc.): the splash will simply play again next time
  }
}
