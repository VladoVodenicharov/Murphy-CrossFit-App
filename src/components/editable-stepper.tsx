import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Fonts, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface EditableStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Unit shown after the number, e.g. "min". */
  suffix?: string;
  /** Text shown when value === 0 (e.g. "No cap"). */
  zeroLabel?: string;
}

/** A number you can TYPE, with − / + for quick nudges. */
export function EditableStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix,
  zeroLabel,
}: EditableStepperProps) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(String(value));

  // Keep the field in sync when value changes via the − / + buttons.
  useEffect(() => {
    if (!focused) setText(value > 0 ? String(value) : '');
  }, [value, focused]);

  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  function commit(next: string) {
    setText(next);
    const n = Number.parseInt(next, 10);
    onChange(Number.isFinite(n) ? clamp(n) : 0);
  }

  function nudge(delta: number) {
    Haptics.selectionAsync();
    onChange(clamp(value + delta));
  }

  const showSuffix = suffix && (focused ? text.length > 0 : value > 0);

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: c.textDim }]}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          onPress={() => nudge(-step)}
          disabled={value <= min}
          hitSlop={6}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: c.surfaceSolid, borderColor: c.border },
            value <= min && styles.disabled,
            pressed && { backgroundColor: c.surfaceSolidPressed },
          ]}>
          <Text style={[styles.glyph, { color: c.text }]}>−</Text>
        </Pressable>

        <View style={[styles.field, { backgroundColor: c.surfaceSolid, borderColor: focused ? c.accent : c.border }]}>
          <TextInput
            value={text}
            onChangeText={commit}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={zeroLabel ?? '0'}
            placeholderTextColor={c.textFaint}
            selectionColor={c.accent}
            keyboardType="number-pad"
            style={[styles.input, { color: c.text }]}
          />
          {showSuffix ? <Text style={[styles.suffix, { color: c.textDim }]}>{suffix}</Text> : null}
        </View>

        <Pressable
          onPress={() => nudge(step)}
          disabled={value >= max}
          hitSlop={6}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: c.surfaceSolid, borderColor: c.border },
            value >= max && styles.disabled,
            pressed && { backgroundColor: c.surfaceSolidPressed },
          ]}>
          <Text style={[styles.glyph, { color: c.text }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
  glyph: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    minWidth: 104,
  },
  input: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts?.rounded,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  suffix: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
});
