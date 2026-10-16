export const colors = {
  bg: '#14161A',
  surface: '#1C1F25',
  surfaceAlt: '#262A32',
  border: '#2E333C',

  text: '#F3F4F6',
  textMuted: '#8B93A1',

  accent: '#10B981',
  accentSoft: 'rgba(16, 185, 129, 0.14)',
  danger: '#EF4444',
} as const;

// 4pt grid
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;

export const radius = { sm: 8, md: 12, lg: 16, full: 999 } as const;

// 3 text styles, 2 weights
export const type = {
  caption: { fontSize: 12, fontWeight: '500' },
  body: { fontSize: 14, fontWeight: '500' },
  title: { fontSize: 18, fontWeight: '700' },
} as const;