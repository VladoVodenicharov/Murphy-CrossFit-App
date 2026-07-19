import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NumberField } from '@/components/number-field';
import { SegmentedPills } from '@/components/segmented-pills';
import { TimeField } from '@/components/time-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { WodFormat } from '@/lib/types';

export interface ScoreValue {
  mm: string;
  ss: string;
  rounds: string;
  reps: string;
  loadKg: string;
  capped: boolean;
}

export const EMPTY_SCORE: ScoreValue = {
  mm: '',
  ss: '',
  rounds: '',
  reps: '',
  loadKg: '',
  capped: false,
};

interface ScoreFieldsProps {
  format: WodFormat;
  value: ScoreValue;
  onChange: (patch: Partial<ScoreValue>) => void;
  prescribedRounds?: number;
}

const FINISH_OPTIONS = [
  { value: 'finished', label: 'Finished' },
  { value: 'capped', label: 'Capped' },
] as const;

/** The right score inputs for each WOD format. */
export function ScoreFields({ format, value, onChange, prescribedRounds }: ScoreFieldsProps) {
  const c = useTheme();
  switch (format) {
    case 'FOR_TIME':
      return (
        <View style={styles.stack}>
          <SegmentedPills
            options={FINISH_OPTIONS}
            value={value.capped ? 'capped' : 'finished'}
            onChange={(v) => onChange({ capped: v === 'capped' })}
          />
          {value.capped ? (
            <NumberField
              label="Reps completed at the cap"
              value={value.reps}
              onChange={(reps) => onChange({ reps })}
            />
          ) : (
            <TimeField
              label="Your time"
              mm={value.mm}
              ss={value.ss}
              onChangeMm={(mm) => onChange({ mm })}
              onChangeSs={(ss) => onChange({ ss })}
            />
          )}
        </View>
      );
    case 'AMRAP':
      return (
        <View style={styles.row}>
          <NumberField label="Rounds" value={value.rounds} onChange={(rounds) => onChange({ rounds })} />
          <NumberField label="Extra reps" value={value.reps} onChange={(reps) => onChange({ reps })} />
        </View>
      );
    case 'EMOM':
      return (
        <NumberField
          label="Rounds completed"
          value={value.rounds}
          onChange={(rounds) => onChange({ rounds })}
          placeholder={prescribedRounds != null ? String(prescribedRounds) : '0'}
        />
      );
    case 'TABATA':
      return <NumberField label="Total reps" value={value.reps} onChange={(reps) => onChange({ reps })} />;
    case 'FOR_LOAD':
      return (
        <View style={styles.row}>
          <NumberField label="Load" value={value.loadKg} onChange={(loadKg) => onChange({ loadKg })} suffix="kg" decimal />
          <NumberField label="Reps (optional)" value={value.reps} onChange={(reps) => onChange({ reps })} />
        </View>
      );
    case 'INTERVALS':
      return (
        <View style={styles.stack}>
          <NumberField label="Total reps" value={value.reps} onChange={(reps) => onChange({ reps })} />
          <TimeField
            label="Total time (optional)"
            mm={value.mm}
            ss={value.ss}
            onChangeMm={(mm) => onChange({ mm })}
            onChangeSs={(ss) => onChange({ ss })}
          />
        </View>
      );
    case 'OTHER':
      return (
        <View style={styles.stack}>
          <Text style={[styles.hint, { color: c.textFaint }]}>Fill in whatever measures this workout.</Text>
          <TimeField
            label="Time"
            mm={value.mm}
            ss={value.ss}
            onChangeMm={(mm) => onChange({ mm })}
            onChangeSs={(ss) => onChange({ ss })}
          />
          <View style={styles.row}>
            <NumberField label="Rounds" value={value.rounds} onChange={(rounds) => onChange({ rounds })} />
            <NumberField label="Reps" value={value.reps} onChange={(reps) => onChange({ reps })} />
          </View>
          <NumberField label="Load" value={value.loadKg} onChange={(loadKg) => onChange({ loadKg })} suffix="kg" decimal />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  hint: {
    fontSize: 13,
  },
});
