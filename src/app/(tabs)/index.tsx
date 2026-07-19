import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChoiceCard } from '@/components/choice-card';
import { GlassCard } from '@/components/glass-card';
import { GradientBackground } from '@/components/gradient-background';
import { BottomTabInset, Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, formatGymScore, formatScore, sessionTitle } from '@/lib/format';
import { listAllHistory, type HistoryItem } from '@/lib/history';

/** Home hub — the three ways to log a workout, plus a peek at recent logs. */
export default function HomeScreen() {
  const c = useTheme();
  const [recent, setRecent] = useState<HistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      setRecent(listAllHistory(3));
    }, []),
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.overline, { color: c.accent }]}>MURPHY</Text>
          <Text style={[styles.title, { color: c.text }]}>Log a workout</Text>

          <ChoiceCard
            icon="trophy-outline"
            title="Benchmark WODs"
            subtitle="Murph, Fran, Cindy & the classics"
            onPress={() => router.push('/benchmarks')}
          />
          <ChoiceCard
            icon="clipboard-outline"
            title="My / box WOD"
            subtitle="Build the WOD, then log your score"
            onPress={() => router.push('/build-wod')}
          />
          <ChoiceCard
            icon="barbell-outline"
            title="Gym exercise"
            subtitle="Strength lifts & cardio"
            onPress={() => router.push('/gym')}
          />

          {recent.length > 0 ? (
            <View style={styles.recentSection}>
              <Text style={[styles.sectionLabel, { color: c.textDim }]}>RECENT</Text>
              {recent.map((item) => (
                <GlassCard key={`${item.type}-${item.row.id}`} style={styles.recentCard}>
                  <View style={styles.recentRow}>
                    <View style={styles.recentLeft}>
                      <Text style={[styles.recentName, { color: c.text }]} numberOfLines={1}>
                        {item.type === 'wod' ? item.row.wod_name : sessionTitle(item.row)}
                      </Text>
                      <Text style={[styles.recentMeta, { color: c.textDim }]}>{formatDate(item.row.performed_at)}</Text>
                    </View>
                    <Text style={[styles.recentScore, { color: c.accent }]}>
                      {item.type === 'wod' ? formatScore(item.row) : formatGymScore(item.row)}
                    </Text>
                  </View>
                </GlassCard>
              ))}
            </View>
          ) : null}
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
    paddingTop: Spacing.sm,
    paddingBottom: BottomTabInset + Spacing.lg,
    gap: Spacing.md,
  },
  overline: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
  recentSection: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  recentCard: {},
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  recentLeft: {
    flex: 1,
    gap: 2,
  },
  recentName: {
    fontSize: 15,
    fontWeight: '700',
  },
  recentMeta: {
    fontSize: 12,
  },
  recentScore: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Fonts?.rounded,
    fontVariant: ['tabular-nums'],
  },
});
