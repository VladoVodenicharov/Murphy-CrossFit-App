import { useColorScheme } from 'react-native';

import { DarkColors, LightColors, type ThemeColors } from '@/constants/theme';

/** Current palette based on the system light/dark setting (defaults to dark). */
export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'light' ? LightColors : DarkColors;
}
