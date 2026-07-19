import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateField } from '@/components/date-field';
import { EMPTY_EXERCISE, ExerciseBlock, type ExerciseDraft } from '@/components/exercise-block';
import { GlassCard } from '@/components/glass-card';
import { GradientBackground } from '@/components/gradient-background';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeader } from '@/components/screen-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { deleteGymSession, getGymSession, saveGymSession, updateGymSession } from '@/lib/db';
import { parseFloatField, parseIntField, parseSessionItems } from '@/lib/format';
import type { StrengthExercise } from '@/lib/types';

function exercisesToDrafts(items: StrengthExercise[]): ExerciseDraft[] {
  if (items.length === 0) return [{ ...EMPTY_EXERCISE }];
  return items.map((ex) => ({
    name: ex.name,
    sets:
      ex.sets.length > 0
        ? ex.sets.map((s) => ({
            repsText: s.reps != null ? String(s.reps) : '',
            kgText: s.kg != null ? String(s.kg) : '',
          }))
        : [{ repsText: '', kgText: '' }],
    caloriesText: ex.calories != null ? String(ex.calories) : '',
  }));
}

/** Log a strength session — one or more exercises, each with its own sets. */
export default function GymStrengthScreen() {
  const c = useTheme();
  const params = useLocalSearchParams<{ logId?: string }>();
  const editId = params.logId ? Number.parseInt(String(params.logId), 10) : null;
  const editing = editId != null && Number.isFinite(editId);

  const initial = useMemo(() => {
    if (editing) {
      const row = getGymSession(editId!);
      if (row) {
        return {
          exercises: exercisesToDrafts(parseSessionItems(row) as StrengthExercise[]),
          date: new Date(row.performed_at),
          notes: row.notes ?? '',
        };
      }
    }
    return { exercises: [{ ...EMPTY_EXERCISE }], date: new Date(), notes: '' };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [exercises, setExercises] = useState<ExerciseDraft[]>(initial.exercises);
  const [date, setDate] = useState<Date>(initial.date);
  const [notes, setNotes] = useState(initial.notes);

  function updateExercise(index: number, patch: Partial<ExerciseDraft>) {
    setExercises((list) => list.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }
  function removeExercise(index: number) {
    setExercises((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : list));
  }
  function addExercise() {
    Haptics.selectionAsync();
    setExercises((list) => [...list, { ...EMPTY_EXERCISE }]);
  }

  function confirmDelete() {
    Alert.alert('Delete session', 'Remove this whole gym session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteGymSession(editId!);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        },
      },
    ]);
  }

  function onSave() {
    const items: StrengthExercise[] = exercises
      .map((e) => ({
        name: e.name.trim(),
        sets: e.sets
          .map((s) => ({ reps: parseIntField(s.repsText) ?? undefined, kg: parseFloatField(s.kgText) ?? undefined }))
          .filter((s) => s.reps != null || s.kg != null),
        calories: parseIntField(e.caloriesText) ?? undefined,
      }))
      .filter((e) => e.name.length > 0 && (e.sets.length > 0 || e.calories != null));

    if (items.length === 0) {
      Alert.alert('Add an exercise', 'Name at least one exercise and log a set or calories.');
      return;
    }

    const input = { kind: 'strength' as const, items, notes: notes || undefined, performedAt: date.toISOString() };

    if (editing) {
      updateGymSession(editId!, input);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } else {
      saveGymSession(input);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.dismissAll();
      router.replace('/history');
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          title={editing ? 'Edit strength session' : 'Log strength'}
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
          <GlassCard>
            <Text style={[styles.cardLabel, { color: c.textDim }]}>EXERCISES</Text>
            <View style={styles.exercisesStack}>
              {exercises.map((draft, i) => (
                <ExerciseBlock
                  key={i}
                  index={i}
                  draft={draft}
                  onChange={(patch) => updateExercise(i, patch)}
                  onRemove={() => removeExercise(i)}
                  removable={exercises.length > 1}
                />
              ))}
              <Pressable
                onPress={addExercise}
                style={[styles.addButton, { borderColor: c.accent, backgroundColor: c.accentSoft }]}>
                <Ionicons name="add" size={18} color={c.accent} />
                <Text style={[styles.addButtonText, { color: c.accent }]}>Add exercise</Text>
              </Pressable>
            </View>
          </GlassCard>

          <GlassCard>
            <Text style={[styles.cardLabel, { color: c.textDim }]}>DETAILS</Text>
            <View style={styles.detailsStack}>
              <DateField label="Date" value={date} onChange={setDate} />
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Notes — how it felt, next time… (optional)"
                placeholderTextColor={c.textFaint}
                selectionColor={c.accent}
                style={[styles.notesInput, { backgroundColor: c.surfaceSolid, borderColor: c.border, color: c.text }]}
                multiline
              />
            </View>
          </GlassCard>

          <PrimaryButton title={editing ? 'SAVE CHANGES' : 'SAVE SESSION'} onPress={onSave} />
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
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: Spacing.md,
  },
  exercisesStack: {
    gap: Spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 11,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailsStack: {
    gap: Spacing.md,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    minHeight: 68,
    textAlignVertical: 'top',
  },
});
