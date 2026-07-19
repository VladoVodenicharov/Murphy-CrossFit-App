import React from 'react';
import { StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  suffix?: string;
  decimal?: boolean;
  style?: ViewStyle;
}

/** Labeled numeric input in the glass style. */
export function NumberField({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  decimal = false,
  style,
}: NumberFieldProps) {
  const c = useTheme();
  return (
    <View style={[styles.wrap, style]}>
      <Text style={[styles.label, { color: c.textDim }]}>{label}</Text>
      <View style={[styles.inputRow, { backgroundColor: c.surfaceSolid, borderColor: c.border }]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder ?? '0'}
          placeholderTextColor={c.textFaint}
          selectionColor={c.accent}
          keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
          style={[styles.input, { color: c.text }]}
        />
        {suffix ? <Text style={[styles.suffix, { color: c.textDim }]}>{suffix}</Text> : null}
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Fonts?.rounded,
    fontVariant: ['tabular-nums'],
  },
  suffix: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});
