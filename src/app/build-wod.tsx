import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EditableStepper } from '@/components/editable-stepper';
import { GlassCard } from '@/components/glass-card';
import { GradientBackground } from '@/components/gradient-background';
import { MovementRow, EMPTY_MOVEMENT, type MovementDraft } from '@/components/movement-row';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeader } from '@/components/screen-header';
import { TimeField } from '@/components/time-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { saveWod } from '@/lib/db';
import { mmss, parseFloatField, parseIntField, parseTime } from '@/lib/format';
import {
  ALL_WOD_FORMATS,
  WOD_FORMAT_LABEL,
  type Movement,
  type WodFormat,
  type WodParams,
} from '@/lib/types';

/** Build a custom/box WOD (structured movements), save it, then log it. */
export default function BuildWodScreen() {
  const c = useTheme();
  const [name, setName] = useState('');
  const [format, setFormat] = useState<WodFormat>('FOR_TIME');
  const [capMin, setCapMin] = useState(0);
  const [amrapMin, setAmrapMin] = useState(12);
  const [intervalMm, setIntervalMm] = useState('1');
  const [intervalSs, setIntervalSs] = useState('00');
  const [rounds, setRounds] = useState(10);
  const [movements, setMovements] = useState<MovementDraft[]>([{ ...EMPTY_MOVEMENT }]);

  const intervalSec = parseTime(intervalMm, intervalSs) ?? 0;

  function updateMovement(index: number, patch: Partial<MovementDraft>) {
    setMovements((list) => list.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }
  function removeMovement(index: number) {
    setMovements((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : list));
  }
  function duplicateMovement(index: number) {
    Haptics.selectionAsync();
    setMovements((list) => [...list.slice(0, index + 1), { ...list[index] }, ...list.slice(index + 1)]);
  }
  function addMovement() {
    Haptics.selectionAsync();
    setMovements((list) => [...list, { ...EMPTY_MOVEMENT }]);
  }

  function buildParams(): WodParams {
    switch (format) {
      case 'FOR_TIME':
        return capMin > 0 ? { capSec: capMin * 60 } : {};
      case 'AMRAP':
        return { durationSec: amrapMin * 60 };
      case 'EMOM':
        return { intervalSec, rounds };
      case 'INTERVALS':
        return { intervalSec, rounds };
      case 'TABATA':
        return { intervalSec: 20, rounds: 8 };
      default:
        return {};
    }
  }

  function onSaveAndLog() {
    const structured: Movement[] = movements
      .filter((m) => m.name.trim().length > 0)
      .map((m) => ({
        name: m.name.trim(),
        unit: m.unit,
        quantity: parseIntField(m.qtyText) ?? undefined,
        weightKg: parseFloatField(m.kgText) ?? undefined,
      }));

    if (structured.length === 0) {
      Alert.alert('Add a movement', 'A WOD needs at least one movement.');
      return;
    }

    const ref = saveWod({
      name: name.trim() || 'Box WOD',
      format,
      params: buildParams(),
      movements: structured,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: '/log', params: { wod: ref } });
  }

  const showParams = format !== 'FOR_LOAD' && format !== 'OTHER';

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Build a WOD" />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
          {/* Name + format */}
          <GlassCard>
            <Text style={[styles.cardLabel, { color: c.textDim }]}>WORKOUT</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name — e.g. Tuesday metcon"
              placeholderTextColor={c.textFaint}
              selectionColor={c.accent}
              style={[styles.nameInput, { backgroundColor: c.surfaceSolid, borderColor: c.border, color: c.text }]}
              returnKeyType="done"
            />
            <View style={styles.formatChips}>
              {ALL_WOD_FORMATS.map((f) => {
                const active = f === format;
                return (
                  <Pressable
                    key={f}
                    onPress={() => {
                      if (!active) {
                        Haptics.selectionAsync();
                        setFormat(f);
                      }
                    }}
                    style={[
                      styles.formatChip,
                      { backgroundColor: active ? c.accent : c.surfaceSolid, borderColor: active ? c.accent : c.border },
                    ]}>
                    <Text style={[styles.formatChipText, { color: active ? c.onAccent : c.textDim }]}>
                      {WOD_FORMAT_LABEL[f]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Format parameters */}
          {showParams ? (
            <GlassCard>
              <Text style={[styles.cardLabel, { color: c.textDim }]}>FORMAT</Text>
              {format === 'FOR_TIME' && (
                <EditableStepper
                  label="Time cap"
                  value={capMin}
                  onChange={setCapMin}
                  min={0}
                  max={180}
                  suffix="min"
                  zeroLabel="No cap"
                />
              )}
              {format === 'AMRAP' && (
                <EditableStepper label="Duration" value={amrapMin} onChange={setAmrapMin} min={1} max={180} suffix="min" />
              )}
              {format === 'EMOM' && (
                <View style={styles.paramsStack}>
                  <TimeField
                    label="Every (interval)"
                    mm={intervalMm}
                    ss={intervalSs}
                    onChangeMm={setIntervalMm}
                    onChangeSs={setIntervalSs}
                  />
                  <EditableStepper label="Rounds" value={rounds} onChange={setRounds} min={1} max={90} />
                  <Text style={[styles.paramHint, { color: c.textFaint }]}>
                    {rounds} × {mmss(intervalSec)} · {mmss(rounds * intervalSec)} total
                  </Text>
                </View>
              )}
              {format === 'INTERVALS' && (
                <View style={styles.paramsStack}>
                  <TimeField
                    label="Each interval"
                    mm={intervalMm}
                    ss={intervalSs}
                    onChangeMm={setIntervalMm}
                    onChangeSs={setIntervalSs}
                  />
                  <EditableStepper label="Rounds" value={rounds} onChange={setRounds} min={1} max={30} />
                  <Text style={[styles.paramHint, { color: c.textFaint }]}>
                    {rounds} × {mmss(intervalSec)} through all stations
                  </Text>
                </View>
              )}
              {format === 'TABATA' && (
                <Text style={[styles.paramHint, { color: c.textFaint }]}>8 rounds · 0:20 work / 0:10 rest</Text>
              )}
            </GlassCard>
          ) : null}

          {/* Movements */}
          <GlassCard>
            <Text style={[styles.cardLabel, { color: c.textDim }]}>
              {format === 'INTERVALS' ? 'STATIONS' : 'MOVEMENTS'}
            </Text>
            {format === 'INTERVALS' ? (
              <Text style={[styles.movementsHint, { color: c.textFaint }]}>
                One round runs through every station, back to back.
              </Text>
            ) : null}
            <View style={styles.movementsStack}>
              {movements.map((draft, i) => (
                <MovementRow
                  key={i}
                  draft={draft}
                  onChange={(patch) => updateMovement(i, patch)}
                  onRemove={() => removeMovement(i)}
                  onDuplicate={() => duplicateMovement(i)}
                  removable={movements.length > 1}
                />
              ))}
              <Pressable
                onPress={addMovement}
                style={[styles.addButton, { borderColor: c.accent, backgroundColor: c.accentSoft }]}>
                <Ionicons name="add" size={18} color={c.accent} />
                <Text style={[styles.addButtonText, { color: c.accent }]}>Add movement</Text>
              </Pressable>
            </View>
          </GlassCard>

          <PrimaryButton title="SAVE & LOG SCORE" onPress={onSaveAndLog} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
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
  nameInput: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  formatChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  formatChip: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  formatChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  paramsStack: {
    gap: Spacing.md,
  },
  paramHint: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  movementsHint: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  movementsStack: {
    gap: Spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingVertical: 11,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
