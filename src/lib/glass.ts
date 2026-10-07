import type { CSSProperties } from 'react';

// Full-screen "liquid glass" overlay: the page behind stays visible, blurred and slightly darkened.
export const glassOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background:
    'radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.10), rgba(255,255,255,0) 55%), rgba(8, 8, 10, 0.26)',
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 120px rgba(255,255,255,0.04)',
};
