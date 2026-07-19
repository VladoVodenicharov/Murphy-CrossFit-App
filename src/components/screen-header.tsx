import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  /** Optional trailing control (e.g. a delete button). */
  right?: React.ReactNode;
}

/** Back chevron + title row for stack screens (headers are custom-drawn). */
export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  const c = useTheme();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onBack ?? (() => router.back())}
        hitSlop={10}
        style={({ pressed }) => [
          styles.side,
          { backgroundColor: c.surfaceSolid, borderColor: c.border },
          pressed && { backgroundColor: c.surfaceSolidPressed },
        ]}>
        <Ionicons name="chevron-back" size={22} color={c.text} />
      </Pressable>
      <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  side: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
});
