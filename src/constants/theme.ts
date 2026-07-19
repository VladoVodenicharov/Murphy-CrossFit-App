import { Platform } from 'react-native';

/**
 * Murphy — "Ember Noir": a chosen neutral ground (near-black / near-white),
 * quiet glass, and orange-red reserved for numbers and actions. Full light +
 * dark. Consume via `useTheme()`; never import a palette object directly.
 */
export interface ThemeColors {
  bg: string;
  bgElevated: string;
  text: string;
  textDim: string;
  textFaint: string;
  /** Translucent glass fill (over the blur). */
  surface: string;
  /** Opaque fill for inputs / controls. */
  surfaceSolid: string;
  surfaceSolidPressed: string;
  border: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  good: string;
  goodSoft: string;
  warn: string;
  warnSoft: string;
  danger: string;
  dangerSoft: string;
  /** Ambient glow blobs behind the glass. */
  glowA: string;
  glowB: string;
  glowOpacityA: number;
  glowOpacityB: number;
  blurTint: 'dark' | 'light';
  blurIntensity: number;
}

export const DarkColors: ThemeColors = {
  bg: '#0a0a0c',
  bgElevated: '#141417',
  text: '#f4f4f6',
  textDim: 'rgba(255,255,255,0.52)',
  textFaint: 'rgba(255,255,255,0.32)',
  surface: 'rgba(255,255,255,0.05)',
  surfaceSolid: 'rgba(255,255,255,0.065)',
  surfaceSolidPressed: 'rgba(255,255,255,0.12)',
  border: 'rgba(255,255,255,0.09)',
  accent: '#ff5a1f',
  accentSoft: 'rgba(255,90,31,0.14)',
  onAccent: '#ffffff',
  good: '#34d27b',
  goodSoft: 'rgba(52,210,123,0.14)',
  warn: '#fbbf24',
  warnSoft: 'rgba(251,191,36,0.14)',
  danger: '#ff453a',
  dangerSoft: 'rgba(255,69,58,0.14)',
  glowA: '#ff3b1f',
  glowB: '#ff7a00',
  glowOpacityA: 0.16,
  glowOpacityB: 0.1,
  blurTint: 'dark',
  blurIntensity: 24,
};

export const LightColors: ThemeColors = {
  bg: '#f4f4f6',
  bgElevated: '#ffffff',
  text: '#111114',
  textDim: 'rgba(17,17,20,0.58)',
  textFaint: 'rgba(17,17,20,0.36)',
  surface: 'rgba(255,255,255,0.72)',
  surfaceSolid: '#ffffff',
  surfaceSolidPressed: '#ececef',
  border: 'rgba(20,20,30,0.10)',
  accent: '#e64a19',
  accentSoft: 'rgba(230,74,25,0.10)',
  onAccent: '#ffffff',
  good: '#1f9d57',
  goodSoft: 'rgba(31,157,87,0.12)',
  warn: '#b45309',
  warnSoft: 'rgba(180,83,9,0.12)',
  danger: '#e5342a',
  dangerSoft: 'rgba(229,52,42,0.10)',
  glowA: '#ff5a1f',
  glowB: '#ff8a1f',
  glowOpacityA: 0.1,
  glowOpacityB: 0.07,
  blurTint: 'light',
  blurIntensity: 30,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const BottomTabInset = Platform.select({ ios: 84, android: 96 }) ?? 84;
