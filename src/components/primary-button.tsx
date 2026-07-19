import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

/** The ember CTA (orange → red gradient with a soft glow). */
export function PrimaryButton({ title, onPress, disabled = false }: PrimaryButtonProps) {
  const c = useTheme();
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        {
          shadowColor: c.accent,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 8,
        },
        { transform: [{ scale: pressed ? 0.98 : 1 }], opacity: disabled ? 0.4 : 1 },
      ]}>
      <LinearGradient
        colors={[c.accent, '#e5342a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <Text style={[styles.title, { color: c.onAccent }]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: Radius.lg,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
});
