import React from 'react';
import { StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface TimeFieldProps {
  label: string;
  mm: string;
  ss: string;
  onChangeMm: (text: string) => void;
  onChangeSs: (text: string) => void;
  style?: ViewStyle;
}

/** mm:ss pair of numeric inputs in the glass style. */
export function TimeField({ label, mm, ss, onChangeMm, onChangeSs, style }: TimeFieldProps) {
  const c = useTheme();
  return (
    <View style={[styles.wrap, style]}>
      <Text style={[styles.label, { color: c.textDim }]}>{label}</Text>
      <View style={styles.row}>
        <View style={[styles.box, { backgroundColor: c.surfaceSolid, borderColor: c.border }]}>
          <TextInput
            value={mm}
            onChangeText={onChangeMm}
            placeholder="mm"
            placeholderTextColor={c.textFaint}
            selectionColor={c.accent}
            keyboardType="number-pad"
            maxLength={3}
            style={[styles.input, { color: c.text }]}
          />
        </View>
        <Text style={[styles.colon, { color: c.textDim }]}>:</Text>
        <View style={[styles.box, { backgroundColor: c.surfaceSolid, borderColor: c.border }]}>
          <TextInput
            value={ss}
            onChangeText={onChangeSs}
            placeholder="ss"
            placeholderTextColor={c.textFaint}
            selectionColor={c.accent}
            keyboardType="number-pad"
            maxLength={2}
            style={[styles.input, { color: c.text }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  box: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
  },
  input: {
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Fonts?.rounded,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  colon: {
    fontSize: 20,
    fontWeight: '800',
  },
});
