import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface GlassCardProps extends ViewProps {
  radius?: number;
  padded?: boolean;
}

/** Frosted glass container: backing BlurView + translucent fill + hairline border. */
export function GlassCard({ children, style, radius = Radius.lg, padded = true, ...rest }: GlassCardProps) {
  const c = useTheme();
  return (
    <View {...rest} style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      <BlurView tint={c.blurTint} intensity={c.blurIntensity} style={StyleSheet.absoluteFill} />
      <View
        style={[
          {
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.surface,
            borderRadius: radius,
          },
          padded && { padding: Spacing.md },
        ]}>
        {children}
      </View>
    </View>
  );
}
