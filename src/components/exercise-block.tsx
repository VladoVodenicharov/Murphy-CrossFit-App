import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EditableStepper } from '@/components/editable-stepper';
import { NameField } from '@/components/name-field';
import { EMPTY_SET, SetRow, type SetDraft } from '@/components/set-row';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { parseIntField } from '@/lib/format';
import { MOVEMENT_NAMES } from '@/lib/movements';

export interface ExerciseDraft {
  name: string;
  sets: SetDraft[];
  caloriesText: string;
}

export const EMPTY_EXERCISE: ExerciseDraft = { name: '', sets: [{ ...EMPTY_SET }], caloriesText: '' };

interface ExerciseBlockProps {
  index: number;
  draft: ExerciseDraft;
  onChange: (patch: Partial<ExerciseDraft>) => void;
  onRemove: () => void;
  removable: boolean;
}

/** One exercise within a strength session: name, sets, optional calories. */
export function ExerciseBlock({ index, draft, onChange, onRemove, removable }: ExerciseBlockProps) {
  const c = useTheme();

  function updateSet(i: number, patch: Partial<SetDraft>) {
    onChange({ sets: draft.sets.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  }
  function removeSet(i: number) {
    onChange({ sets: draft.sets.length > 1 ? draft.sets.filter((_, idx) => idx !== i) : draft.sets });
  }
  function addSet() {
    Haptics.selectionAsync();
    onChange({ sets: [...draft.sets, { ...EMPTY_SET }] });
  }

  return (
    <View style={[styles.block, { borderColor: c.border, backgroundColor: c.bgElevated }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: c.textFaint }]}>EXERCISE {index + 1}</Text>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            onRemove();
          }}
          disabled={!removable}
          hitSlop={8}
          style={[
            styles.removeButton,
            { backgroundColor: c.surfaceSolid, borderColor: c.border },
            !removable && styles.removeDisabled,
          ]}>
          <Ionicons name="close" size={16} color={c.textDim} />
        </Pressable>
      </View>

      <NameField value={draft.name} onChange={(name) => onChange({ name })} pool={MOVEMENT_NAMES} placeholder="e.g. Back Squat" />

      <View style={styles.setsStack}>
        {draft.sets.map((s, i) => (
          <SetRow
            key={i}
            index={i}
            draft={s}
            onChange={(patch) => updateSet(i, patch)}
            onRemove={() => removeSet(i)}
            removable={draft.sets.length > 1}
          />
        ))}
        <Pressable onPress={addSet} style={[styles.addSetButton, { borderColor: c.accent, backgroundColor: c.accentSoft }]}>
          <Ionicons name="add" size={16} color={c.accent} />
          <Text style={[styles.addSetText, { color: c.accent }]}>Add set</Text>
        </Pressable>
      </View>

      <EditableStepper
        label="Calories"
        value={parseIntField(draft.caloriesText) ?? 0}
        onChange={(v) => onChange({ caloriesText: v > 0 ? String(v) : '' })}
        min={0}
        max={2000}
        suffix="cal"
        zeroLabel="—"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeDisabled: {
    opacity: 0.25,
  },
  setsStack: {
    gap: Spacing.sm,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingVertical: 9,
  },
  addSetText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
