import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NameField } from '@/components/name-field';
import { NumberField } from '@/components/number-field';
import { TimeField } from '@/components/time-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CARDIO_NAMES } from '@/lib/movements';

export interface CardioDraft {
  name: string;
  mm: string;
  ss: string;
  distanceText: string;
  caloriesText: string;
}

export const EMPTY_CARDIO: CardioDraft = { name: '', mm: '', ss: '', distanceText: '', caloriesText: '' };

interface CardioBlockProps {
  index: number;
  draft: CardioDraft;
  onChange: (patch: Partial<CardioDraft>) => void;
  onRemove: () => void;
  removable: boolean;
}

/** One activity within a cardio session: name, duration, distance, calories. */
export function CardioBlock({ index, draft, onChange, onRemove, removable }: CardioBlockProps) {
  const c = useTheme();

  return (
    <View style={[styles.block, { borderColor: c.border, backgroundColor: c.bgElevated }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: c.textFaint }]}>ACTIVITY {index + 1}</Text>
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

      <NameField value={draft.name} onChange={(name) => onChange({ name })} pool={CARDIO_NAMES} showAllWhenEmpty placeholder="e.g. Run" />

      <TimeField label="Duration" mm={draft.mm} ss={draft.ss} onChangeMm={(mm) => onChange({ mm })} onChangeSs={(ss) => onChange({ ss })} />
      <View style={styles.row}>
        <NumberField label="Distance" value={draft.distanceText} onChange={(distanceText) => onChange({ distanceText })} suffix="m" decimal />
        <NumberField label="Calories" value={draft.caloriesText} onChange={(caloriesText) => onChange({ caloriesText })} suffix="cal" />
      </View>
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
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
