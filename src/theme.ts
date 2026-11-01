import { TextStyle } from 'react-native';

export const colors = {
  bg: '#F2F2F2',
  surface: '#FFFFFF',
  ink: '#111111',
  ink2: '#3A3A3A',
  muted: '#8E8E93',
  faint: '#B9B9BE',
  line: '#E5E5E7',
  soft: '#EAEAEC',
  black: '#000000',
  white: '#FFFFFF',
  danger: '#C2362F',
};

// Inter Tight for display text, Inter for UI text. Letters are pulled
// together very slightly; styles that set their own letterSpacing override it.
const font = (fontFamily: string, letterSpacing: number): TextStyle => ({
  fontFamily,
  letterSpacing,
});

export const fonts = {
  display: font('InterTight-Regular', -0.4),
  displayMedium: font('InterTight-Medium', -0.4),
  displaySemi: font('InterTight-SemiBold', -0.4),
  body: font('Inter-Regular', -0.1),
  bodyMedium: font('Inter-Medium', -0.1),
  bodySemi: font('Inter-SemiBold', -0.1),
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  button: 20,
  pill: 999,
};

export const space = {
  gutter: 20,
};
