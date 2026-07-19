import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChoiceCard } from '@/components/choice-card';
import { GradientBackground } from '@/components/gradient-background';
import { ScreenHeader } from '@/components/screen-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Gym entry point — a strength lift or a cardio activity. */
export default function GymScreen() {
  const c = useTheme();
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Gym" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.hint, { color: c.textDim }]}>What did you train?</Text>
          <ChoiceCard
            icon="barbell-outline"
            title="Strength lift"
            subtitle="Sets × reps × weight in kg"
            onPress={() => router.push('/gym-strength')}
          />
          <ChoiceCard
            icon="bicycle-outline"
            title="Cardio"
            subtitle="Run, row, bike, swim — time, distance, calories"
            onPress={() => router.push('/gym-cardio')}
          />
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
  hint: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
});
