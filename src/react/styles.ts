import type { CSSProperties } from 'react';

/** Visually hidden (screen-reader only), same role as Tailwind `sr-only`. */
export const srOnly: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
};

export const popoverContentBase: CSSProperties = {
  zIndex: 100,
  width: 'min(calc(100vw - 1.5rem), 380px)',
  borderRadius: 2,
  border: '1px solid #edebe9',
  background: '#fff',
  boxShadow: '0 6.4px 14.4px rgba(0,0,0,0.132), 0 1.2px 3.6px rgba(0,0,0,0.108)',
  outline: 'none',
};
