import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { defaultUnitFor, suggestMovements } from '@/lib/movements';
import { MOVEMENT_UNITS, MOVEMENT_UNIT_LABEL, type MovementUnit } from '@/lib/types';

export interface MovementDraft {
  name: string;
  unit: MovementUnit;
  qtyText: string;
  kgText: string;
}

export const EMPTY_MOVEMENT: MovementDraft = { name: '', unit: 'reps', qtyText: '', kgText: '' };

interface MovementRowProps {
  draft: MovementDraft;
  onChange: (patch: Partial<MovementDraft>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  removable: boolean;
}

/** One structured movement: name (+ suggestions), unit, quantity, optional kg. */
export function MovementRow({ draft, onChange, onRemove, onDuplicate, removable }: MovementRowProps) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);
  const suggestions = focused ? suggestMovements(draft.name) : [];

  function pickName(name: string) {
    // Auto-pick a sensible unit for cardio; never clobber an explicit reps override.
    const guessed = defaultUnitFor(name);
    onChange(guessed !== 'reps' ? { name, unit: guessed } : { name });
  }

  const qtyPlaceholder = draft.unit === 'reps' ? 'reps' : draft.unit;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={[styles.nameBox, { backgroundColor: c.surfaceSolid, borderColor: c.border }]}>
          <TextInput
            value={draft.name}
            onChangeText={(name) => onChange({ name })}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              if (draft.name.trim()) pickName(draft.name.trim());
            }}
            placeholder="Movement"
            placeholderTextColor={c.textFaint}
            selectionColor={c.accent}
            style={[styles.nameInput, { color: c.text }]}
            autoCapitalize="words"
          />
        </View>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            onDuplicate();
          }}
          hitSlop={8}
          style={[styles.iconButton, { backgroundColor: c.surfaceSolid, borderColor: c.border }]}>
          <Ionicons name="copy-outline" size={15} color={c.textDim} />
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            onRemove();
          }}
          disabled={!removable}
          hitSlop={8}
          style={[styles.iconButton, { backgroundColor: c.surfaceSolid, borderColor: c.border }, !removable && styles.removeDisabled]}>
          <Ionicons name="close" size={16} color={c.textDim} />
        </Pressable>
      </View>

      <View style={styles.bottomRow}>
        <View style={[styles.unitTrack, { backgroundColor: c.surfaceSolid, borderColor: c.border }]}>
          {MOVEMENT_UNITS.map((u) => {
            const active = u === draft.unit;
            return (
              <Pressable
                key={u}
                onPress={() => {
                  Haptics.selectionAsync();
                  onChange({ unit: u });
                }}
                style={[styles.unitPill, active && { backgroundColor: c.accent }]}>
                <Text style={[styles.unitText, { color: active ? c.onAccent : c.textDim }]}>
                  {MOVEMENT_UNIT_LABEL[u]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={[styles.numBox, { backgroundColor: c.surfaceSolid, borderColor: c.border }]}>
          <TextInput
            value={draft.qtyText}
            onChangeText={(qtyText) => onChange({ qtyText })}
            placeholder={qtyPlaceholder}
            placeholderTextColor={c.textFaint}
            selectionColor={c.accent}
            keyboardType="number-pad"
            style={[styles.numInput, { color: c.text }]}
          />
        </View>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nameBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
  },
  nameInput: {
    paddingVertical: 11,
    fontSize: 15,
    fontWeight: '600',
  },
  iconButton: {
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unitTrack: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.pill,
    padding: 3,
    gap: 2,
  },
  unitPill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '700',
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
});
