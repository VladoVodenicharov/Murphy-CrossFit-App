import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface SetDraft {
  repsText: string;
  kgText: string;
}

export const EMPTY_SET: SetDraft = { repsText: '', kgText: '' };

interface SetRowProps {
  index: number;
  draft: SetDraft;
  onChange: (patch: Partial<SetDraft>) => void;
  onRemove: () => void;
  removable: boolean;
}

/** One strength set: reps × kg, with a remove button. */
export function SetRow({ index, draft, onChange, onRemove, removable }: SetRowProps) {
  const c = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.index, { color: c.textFaint }]}>{index + 1}</Text>
      <View style={[styles.numBox, { backgroundColor: c.surfaceSolid, borderColor: c.border }]}>
        <TextInput
          value={draft.repsText}
          onChangeText={(repsText) => onChange({ repsText })}
          placeholder="reps"
          placeholderTextColor={c.textFaint}
          selectionColor={c.accent}
          keyboardType="number-pad"
          style={[styles.numInput, { color: c.text }]}
        />
      </View>
      <Text style={[styles.times, { color: c.textFaint }]}>×</Text>
      <View style={[styles.numBox, { backgroundColor: c.surfaceSolid, borderColor: c.border }]}>
        <TextInput
          value={draft.kgText}
          onChangeText={(kgText) => onChange({ kgText })}
          placeholder="kg"
          placeholderTextColor={c.textFaint}
          selectionColor={c.accent}
          keyboardType="decimal-pad"
          style={[styles.numInput, { color: c.text }]}
        />
      </View>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          onRemove();
        }}
        disabled={!removable}
        hitSlop={8}
        style={[styles.removeButton, { backgroundColor: c.surfaceSolid, borderColor: c.border }, !removable && styles.removeDisabled]}>
        <Ionicons name="close" size={16} color={c.textDim} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  index: {
    width: 16,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  numBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
  },
  numInput: {
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Fonts?.rounded,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  times: {
    fontSize: 14,
    fontWeight: '700',
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeDisabled: {
    opacity: 0.25,
  },
});
