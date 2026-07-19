import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface NameFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  /** Name pool to suggest from while focused. */
  pool: readonly string[];
  /** Show the pool's first few entries even before typing (good for small pools). */
  showAllWhenEmpty?: boolean;
  placeholder?: string;
}

function matches(pool: readonly string[], query: string, limit: number, showAllWhenEmpty: boolean): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return showAllWhenEmpty ? pool.slice(0, limit) : [];
  const starts: string[] = [];
  const contains: string[] = [];
  for (const name of pool) {
    const lower = name.toLowerCase();
    if (lower === q) continue;
    if (lower.startsWith(q)) starts.push(name);
    else if (lower.includes(q)) contains.push(name);
  }
  return [...starts, ...contains].slice(0, limit);
}

/** Labeled name input with tap-to-fill suggestion chips from a fixed pool. */
export function NameField({ label, value, onChange, pool, showAllWhenEmpty = false, placeholder = 'Name' }: NameFieldProps) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);
  const suggestions = focused ? matches(pool, value, 6, showAllWhenEmpty) : [];

  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: c.textDim }]}>{label}</Text> : null}
      <View style={[styles.box, { backgroundColor: c.surfaceSolid, borderColor: focused ? c.accent : c.border }]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={c.textFaint}
          selectionColor={c.accent}
          style={[styles.input, { color: c.text }]}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </View>
      {suggestions.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          style={styles.chipsRow}
          contentContainerStyle={styles.chipsContent}>
          {suggestions.map((s) => (
            <Pressable
              key={s}
              onPress={() => {
                Haptics.selectionAsync();
                onChange(s);
              }}
              style={[styles.chip, { backgroundColor: c.surfaceSolid, borderColor: c.border }]}>
              <Text style={[styles.chipText, { color: c.text }]}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  box: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
  },
  input: {
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  chipsRow: {
    marginTop: -2,
  },
  chipsContent: {
    gap: Spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
