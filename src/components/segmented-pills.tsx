import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Option<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedPillsProps<T extends string | number> {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Glass segmented control — the active segment fills with ember accent. */
export function SegmentedPills<T extends string | number>({
  options,
  value,
  onChange,
}: SegmentedPillsProps<T>) {
  const c = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: c.surfaceSolid, borderColor: c.border }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => {
              if (!active) {
                Haptics.selectionAsync();
                onChange(option.value);
              }
            }}
            style={[styles.pill, active && { backgroundColor: c.accent }]}>
            <Text
              style={[
                styles.label,
                { color: active ? c.onAccent : c.textDim, fontWeight: active ? '800' : '600' },
              ]}
              numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.pill,
    padding: 4,
    gap: 4,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
