import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

function Glow({
  color,
  opacity,
  size,
  style,
}: {
  color: string;
  opacity: number;
  size: number;
  style?: ViewStyle;
}) {
  // Concentric translucent rings fake a soft blur without a native blur pass.
  return (
    <View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' },
        style,
      ]}>
      <View
        style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: opacity * 0.5 }}
      />
      <View
        style={{ position: 'absolute', width: size * 0.66, height: size * 0.66, borderRadius: (size * 0.66) / 2, backgroundColor: color, opacity: opacity * 0.8 }}
      />
      <View
        style={{ position: 'absolute', width: size * 0.36, height: size * 0.36, borderRadius: (size * 0.36) / 2, backgroundColor: color, opacity }}
      />
    </View>
  );
}

/** Neutral ground with two restrained ember glow nodes (Ember Noir). */
export function GradientBackground({ children }: { children?: React.ReactNode }) {
  const c = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Glow color={c.glowA} opacity={c.glowOpacityA} size={320} style={{ top: -90, right: -90 }} />
      <Glow color={c.glowB} opacity={c.glowOpacityB} size={380} style={{ bottom: -60, left: -130 }} />
      {children}
    </View>
  );
}
