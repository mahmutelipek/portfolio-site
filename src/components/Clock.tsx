import { useEffect, useState } from 'react';

// Change these to update the live clock shown in the footer.
const TIME_ZONE = 'Europe/Istanbul';
const PLACE = 'Türkiye';

const formatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: TIME_ZONE,
});

export function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <style>{`
        @keyframes clock-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>
      <span
        aria-hidden="true"
        style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'clock-pulse 2s ease-in-out infinite' }}
      />
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatter.format(now).toLowerCase()} in {PLACE}
      </span>
    </span>
  );
}
