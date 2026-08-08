import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { GradientBackground } from '@/components/gradient-background';
import { ScreenHeader } from '@/components/screen-header';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/lib/format';
import {
  getCardioPRs,
  getMovementPRs,
  getWodPRs,
  type CardioPR,
  type MovementPR,
  type WodPR,
} from '@/lib/prs';
import { WOD_FORMAT_LABEL } from '@/lib/types';

/** 102.5 → "102.5", 100 → "100" (no trailing ".0"). */
function trimNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** Round an estimated 1RM to the nearest 0.5 kg (real plates), then trim. */
function estKg(n: number): string {
  return trimNum(Math.round(n * 2) / 2);
}

/** Your best lifts, cardio efforts, and benchmark/named WOD scores. */
export default function PRsScreen() {
  const c = useTheme();
  const [lifts, setLifts] = useState<MovementPR[]>([]);
  const [cardio, setCardio] = useState<CardioPR[]>([]);
  const [wods, setWods] = useState<WodPR[]>([]);

  useFocusEffect(
    useCallback(() => {
      setLifts(getMovementPRs());
      setCardio(getCardioPRs());
      setWods(getWodPRs());
    }, []),
  );

  function open(pathname: '/gym-strength' | '/gym-cardio' | '/log', idKey: 'logId' | 'resultId', id: number) {
    Haptics.selectionAsync();
    router.push({ pathname, params: { [idKey]: String(id) } });
  }

  const hasAny = lifts.length > 0 || cardio.length > 0 || wods.length > 0;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Personal Records" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!hasAny ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={[styles.emptyTitle, { color: c.text }]}>No records yet</Text>
              <Text style={[styles.emptyBody, { color: c.textDim }]}>
                Log a few lifts, cardio efforts, or benchmark WODs and your bests show up here.
              </Text>
            </GlassCard>
          ) : (
            <>
              <SectionCard label="BEST LIFTS">
                {lifts.length === 0 ? (
                  <EmptyLine text="No strength sets logged yet." />
                ) : (
                  lifts.map((pr, i) => (
                    <PRRow
                      key={`lift-${pr.name}`}
                      divider={i > 0}
                      onPress={() => open('/gym-strength', 'logId', pr.sourceId)}
                      name={pr.name}
                      sub={
                        pr.est1RMSet
                          ? `est. 1RM ${estKg(pr.est1RM)} kg · from ${trimNum(pr.est1RMSet.kg)}×${pr.est1RMSet.reps}`
                          : `est. 1RM ${estKg(pr.est1RM)} kg`
                      }
                      value={`${trimNum(pr.topKg)} kg${pr.topReps != null ? ` × ${pr.topReps}` : ''}`}
                      date={formatDate(pr.achievedAt)}
                    />
                  ))
                )}
              </SectionCard>

              <SectionCard label="BEST CARDIO">
                {cardio.length === 0 ? (
                  <EmptyLine text="No cardio efforts logged yet." />
                ) : (
                  cardio.map((pr, i) => {
                    const hasDist = pr.bestDistanceM != null;
                    const value = hasDist ? `${trimNum(pr.bestDistanceM!)} m` : `${pr.bestCalories} cal`;
                    const date = formatDate((hasDist ? pr.distanceAt : pr.caloriesAt)!);
                    const sourceId = (hasDist ? pr.distanceSourceId : pr.caloriesSourceId)!;
                    const sub = hasDist && pr.bestCalories != null ? `best ${pr.bestCalories} cal` : '';
                    return (
                      <PRRow
                        key={`cardio-${pr.name}`}
                        divider={i > 0}
                        onPress={() => open('/gym-cardio', 'logId', sourceId)}
                        name={pr.name}
                        sub={sub}
                        value={value}
                        date={date}
                      />
                    );
                  })
                )}
              </SectionCard>

              <SectionCard label="BEST WOD TIMES & SCORES">
                {wods.length === 0 ? (
                  <EmptyLine text="No rankable WODs logged yet." />
                ) : (
                  wods.map((pr, i) => (
                    <PRRow
                      key={`wod-${pr.wodRef}`}
                      divider={i > 0}
                      onPress={() => open('/log', 'resultId', pr.sourceId)}
                      name={pr.wodName}
                      sub={WOD_FORMAT_LABEL[pr.format]}
                      value={pr.scoreDisplay}
                      date={formatDate(pr.achievedAt)}
                    />
                  ))
                )}
              </SectionCard>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

function SectionCard({ label, children }: { label: string; children: React.ReactNode }) {
  const c = useTheme();
  return (
    <GlassCard>
      <Text style={[styles.cardLabel, { color: c.textDim }]}>{label}</Text>
      <View style={styles.rows}>{children}</View>
    </GlassCard>
  );
}

function EmptyLine({ text }: { text: string }) {
  const c = useTheme();
  return <Text style={[styles.emptyLine, { color: c.textFaint }]}>{text}</Text>;
}

interface PRRowProps {
  onPress: () => void;
  name: string;
  sub: string;
  value: string;
  date: string;
  divider: boolean;
}

function PRRow({ onPress, name, sub, value, date, divider }: PRRowProps) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
        pressed && { opacity: 0.6 },
      ]}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowName, { color: c.text }]} numberOfLines={1}>
          {name}
        </Text>
        {sub ? (
          <Text style={[styles.rowSub, { color: c.textDim }]} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowValue, { color: c.accent }]}>{value}</Text>
        <Text style={[styles.rowDate, { color: c.textFaint }]}>{date}</Text>
      </View>
    </Pressable>
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
    marginBottom: Spacing.sm,
  },
  rows: {
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 11,
  },
  rowLeft: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '800',
  },
  rowSub: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rowValue: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Fonts?.rounded,
    fontVariant: ['tabular-nums'],
  },
  rowDate: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  emptyLine: {
    fontSize: 13.5,
    fontWeight: '500',
    paddingVertical: 4,
  },
  emptyCard: {
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
