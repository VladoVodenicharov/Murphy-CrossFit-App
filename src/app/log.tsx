import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateField } from '@/components/date-field';
import { GlassCard } from '@/components/glass-card';
import { GradientBackground } from '@/components/gradient-background';
import { PrimaryButton } from '@/components/primary-button';
import { ScoreFields, EMPTY_SCORE, type ScoreValue } from '@/components/score-fields';
import { ScreenHeader } from '@/components/screen-header';
import { SegmentedPills } from '@/components/segmented-pills';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  deleteResult,
  getResult,
  getWod,
  saveResult,
  updateResult,
  type SaveResultInput,
} from '@/lib/db';
import { movementLine, parseFloatField, parseIntField, parseTime, wodBlurb } from '@/lib/format';
import { findBenchmark } from '@/lib/presets';
import type { ResultRow, WodDef } from '@/lib/types';

const RX_OPTIONS = [
  { value: 'rx', label: 'RX' },
  { value: 'scaled', label: 'Scaled' },
] as const;

function resolveWod(ref: string | undefined): WodDef | null {
  if (!ref) return null;
  if (ref.startsWith('benchmark:')) return findBenchmark(ref) ?? null;
  if (ref.startsWith('custom:')) {
    const id = Number.parseInt(ref.slice('custom:'.length), 10);
    return Number.isFinite(id) ? getWod(id) : null;
  }
  return null;
}

/** Rebuild a minimal WOD when its definition is gone but a log still references it. */
function minimalWod(row: ResultRow): WodDef {
  return { ref: row.wod_ref, name: row.wod_name, format: row.wod_format, params: {}, movements: [] };
}

function scoreFromRow(row: ResultRow): ScoreValue {
  const s: ScoreValue = { ...EMPTY_SCORE, capped: row.is_capped === 1 };
  if (row.score_time_sec != null) {
    s.mm = String(Math.floor(row.score_time_sec / 60));
    s.ss = String(row.score_time_sec % 60).padStart(2, '0');
  }
  if (row.score_rounds != null) s.rounds = String(row.score_rounds);
  if (row.score_reps != null) s.reps = String(row.score_reps);
  if (row.score_load_kg != null) s.loadKg = String(row.score_load_kg);
  return s;
}

/** Shared score screen — logs a new score, or edits an existing one. */
export default function LogScreen() {
  const c = useTheme();
  const params = useLocalSearchParams<{ wod?: string; resultId?: string }>();
  const editId = params.resultId ? Number.parseInt(String(params.resultId), 10) : null;
  const editing = editId != null && Number.isFinite(editId);

  const initial = useMemo(() => {
    if (editing) {
      const row = getResult(editId!);
      if (row) {
        return {
          wod: resolveWod(row.wod_ref) ?? minimalWod(row),
          score: scoreFromRow(row),
          date: new Date(row.performed_at),
          isRx: row.is_rx === 1,
          notes: row.notes ?? '',
        };
      }
    }
    return {
      wod: resolveWod(params.wod),
      score: EMPTY_SCORE,
      date: new Date(),
      isRx: true,
      notes: '',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wod = initial.wod;
  const [score, setScore] = useState<ScoreValue>(initial.score);
  const [isRx, setIsRx] = useState(initial.isRx);
  const [date, setDate] = useState<Date>(initial.date);
  const [notes, setNotes] = useState(initial.notes);

  if (!wod) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScreenHeader title="Log score" />
          <GlassCard style={{ margin: Spacing.md }}>
            <Text style={{ color: c.textDim, fontSize: 15 }}>Couldn&apos;t find that WOD.</Text>
          </GlassCard>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  function confirmDelete() {
    Alert.alert('Delete log', `Remove this ${wod!.name} log?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteResult(editId!);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        },
      },
    ]);
  }

  function onSave(def: WodDef) {
    const timeSec = parseTime(score.mm, score.ss);
    const rounds = parseIntField(score.rounds);
    const reps = parseIntField(score.reps);
    const loadKg = parseFloatField(score.loadKg);

    const hasPrimary = (() => {
      switch (def.format) {
        case 'FOR_TIME':
          return score.capped ? reps != null : timeSec != null;
        case 'AMRAP':
        case 'EMOM':
          return rounds != null;
        case 'TABATA':
          return reps != null;
        case 'FOR_LOAD':
          return loadKg != null;
        case 'INTERVALS':
        case 'OTHER':
          return timeSec != null || rounds != null || reps != null || loadKg != null;
      }
    })();

    if (!hasPrimary) {
      Alert.alert('Add your score', 'Enter the result before saving.');
      return;
    }

    const input: SaveResultInput = {
      wod: def,
      scoreTimeSec: def.format === 'FOR_TIME' && score.capped ? undefined : timeSec ?? undefined,
      scoreRounds: rounds ?? undefined,
      scoreReps: reps ?? undefined,
      scoreLoadKg: loadKg ?? undefined,
      isCapped: def.format === 'FOR_TIME' && score.capped,
      isRx,
      notes: notes || undefined,
      performedAt: date.toISOString(),
    };

    if (editing) {
      updateResult(editId!, input);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } else {
      saveResult(input);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.dismissAll();
      router.replace('/history');
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          title={wod.name}
          right={
            editing ? (
              <Pressable onPress={confirmDelete} hitSlop={10} style={styles.trash}>
                <Ionicons name="trash-outline" size={20} color={c.danger} />
              </Pressable>
            ) : undefined
          }
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
          {/* The WOD, read-only */}
          <GlassCard>
            <Text style={[styles.blurb, { color: c.accent }]}>{wodBlurb(wod)}</Text>
            {wod.description ? <Text style={[styles.description, { color: c.textDim }]}>{wod.description}</Text> : null}
            {wod.movements.length > 0 ? (
              <View style={styles.movements}>
                {wod.movements.map((m, i) => (
                  <Text key={`${m.name}-${i}`} style={[styles.movementLine, { color: c.text }]}>
                    {movementLine(m)}
                  </Text>
                ))}
              </View>
            ) : null}
          </GlassCard>

          {/* Score entry */}
          <GlassCard>
            <Text style={[styles.cardLabel, { color: c.textDim }]}>YOUR SCORE</Text>
            <ScoreFields
              format={wod.format}
              value={score}
              onChange={(patch) => setScore((s) => ({ ...s, ...patch }))}
              prescribedRounds={wod.params.rounds}
            />
          </GlassCard>

          {/* Details */}
          <GlassCard>
            <Text style={[styles.cardLabel, { color: c.textDim }]}>DETAILS</Text>
            <View style={styles.detailsStack}>
              <SegmentedPills
                options={RX_OPTIONS}
                value={isRx ? 'rx' : 'scaled'}
                onChange={(v) => setIsRx(v === 'rx')}
              />
              <DateField label="Date" value={date} onChange={setDate} />
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Notes — scaling, how it felt… (optional)"
                placeholderTextColor={c.textFaint}
                selectionColor={c.accent}
                style={[styles.notesInput, { backgroundColor: c.surfaceSolid, borderColor: c.border, color: c.text }]}
                multiline
              />
            </View>
          </GlassCard>

          <PrimaryButton title={editing ? 'SAVE CHANGES' : 'SAVE SCORE'} onPress={() => onSave(wod)} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  trash: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  blurb: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: Spacing.sm,
  },
  movements: {
    marginTop: Spacing.sm,
    gap: 4,
  },
  movementLine: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: Spacing.md,
  },
  detailsStack: {
    gap: Spacing.md,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    minHeight: 68,
    textAlignVertical: 'top',
  },
});
