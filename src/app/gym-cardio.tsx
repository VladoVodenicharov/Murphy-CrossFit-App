import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CardioBlock, EMPTY_CARDIO, type CardioDraft } from '@/components/cardio-block';
import { DateField } from '@/components/date-field';
import { GlassCard } from '@/components/glass-card';
import { GradientBackground } from '@/components/gradient-background';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeader } from '@/components/screen-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { deleteGymSession, getGymSession, saveGymSession, updateGymSession } from '@/lib/db';
import { mmss, parseFloatField, parseIntField, parseSessionItems, parseTime } from '@/lib/format';
import type { CardioActivity } from '@/lib/types';

function activitiesToDrafts(items: CardioActivity[]): CardioDraft[] {
  if (items.length === 0) return [{ ...EMPTY_CARDIO }];
  return items.map((act) => {
    const [mm, ss] = act.durationSec != null ? mmss(act.durationSec).split(':') : ['', ''];
    return {
      name: act.name,
      mm,
      ss,
      distanceText: act.distanceM != null ? String(act.distanceM) : '',
      caloriesText: act.calories != null ? String(act.calories) : '',
    };
  });
}

/** Log a cardio session — one or more activities, each with time/distance/calories. */
export default function GymCardioScreen() {
  const c = useTheme();
  const params = useLocalSearchParams<{ logId?: string }>();
  const editId = params.logId ? Number.parseInt(String(params.logId), 10) : null;
  const editing = editId != null && Number.isFinite(editId);

  const initial = useMemo(() => {
    if (editing) {
      const row = getGymSession(editId!);
      if (row) {
        return {
          activities: activitiesToDrafts(parseSessionItems(row) as CardioActivity[]),
          date: new Date(row.performed_at),
          notes: row.notes ?? '',
        };
      }
    }
    return { activities: [{ ...EMPTY_CARDIO }], date: new Date(), notes: '' };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activities, setActivities] = useState<CardioDraft[]>(initial.activities);
  const [date, setDate] = useState<Date>(initial.date);
  const [notes, setNotes] = useState(initial.notes);

  function updateActivity(index: number, patch: Partial<CardioDraft>) {
    setActivities((list) => list.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }
  function removeActivity(index: number) {
    setActivities((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : list));
  }
  function addActivity() {
    Haptics.selectionAsync();
    setActivities((list) => [...list, { ...EMPTY_CARDIO }]);
  }

  function confirmDelete() {
    Alert.alert('Delete session', 'Remove this whole cardio session?', [
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
    const items: CardioActivity[] = activities
      .map((a) => ({
        name: a.name.trim(),
        durationSec: parseTime(a.mm, a.ss) ?? undefined,
        distanceM: parseFloatField(a.distanceText) ?? undefined,
        calories: parseIntField(a.caloriesText) ?? undefined,
      }))
      .filter((a) => a.name.length > 0 && (a.durationSec != null || a.distanceM != null || a.calories != null));

    if (items.length === 0) {
      Alert.alert('Add an activity', 'Name at least one activity and enter time, distance, or calories.');
      return;
    }

    const input = { kind: 'cardio' as const, items, notes: notes || undefined, performedAt: date.toISOString() };

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
          title={editing ? 'Edit cardio session' : 'Log cardio'}
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
            <Text style={[styles.cardLabel, { color: c.textDim }]}>ACTIVITIES</Text>
            <View style={styles.activitiesStack}>
              {activities.map((draft, i) => (
                <CardioBlock
                  key={i}
                  index={i}
                  draft={draft}
                  onChange={(patch) => updateActivity(i, patch)}
                  onRemove={() => removeActivity(i)}
                  removable={activities.length > 1}
                />
              ))}
              <Pressable
                onPress={addActivity}
                style={[styles.addButton, { borderColor: c.accent, backgroundColor: c.accentSoft }]}>
                <Ionicons name="add" size={18} color={c.accent} />
                <Text style={[styles.addButtonText, { color: c.accent }]}>Add activity</Text>
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
                placeholder="Notes — pace, how it felt… (optional)"
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
  activitiesStack: {
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
