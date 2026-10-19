// chess-theme.ts
import { Platform, ViewStyle } from 'react-native';

export const colors = {
  bg: '#0B1220',
  surface: '#1E293B',
  surfaceAlt: '#0F172A',
  surfaceRaised: '#273449',
  border: '#334155',
  borderSoft: '#243045',
  text: '#F8FAFC',
  textSoft: '#CBD5E1',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  primary: '#10B981',
  primaryDark: '#059669',
  primaryBg: '#064E3B',
  danger: '#EF4444',
  dangerBg: '#450A0A',
  warning: '#F59E0B',
  info: '#38BDF8',
  purple: '#7C3AED',
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

export const type = {
  micro: 10,
  caption: 11,
  small: 12,
  body: 14,
  title: 16,
  h2: 20,
  h1: 24,
};

export const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export const shadow = (elevation = 4): ViewStyle => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: Math.round(elevation / 2) },
  shadowOpacity: 0.3,
  shadowRadius: elevation * 1.5,
  elevation,
});