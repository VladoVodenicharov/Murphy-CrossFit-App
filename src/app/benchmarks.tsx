import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { GradientBackground } from '@/components/gradient-background';
import { ScreenHeader } from '@/components/screen-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { listWods } from '@/lib/db';
import { movementsSummary, wodBlurb } from '@/lib/format';
import { BENCHMARKS } from '@/lib/presets';
import type { WodDef } from '@/lib/types';

function WodRow({ def }: { def: WodDef }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        router.push({ pathname: '/log', params: { wod: def.ref } });
      }}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      <GlassCard>
        <Text style={[styles.rowName, { color: c.text }]}>{def.name}</Text>
        <Text style={[styles.rowBlurb, { color: c.accent }]}>{wodBlurb(def)}</Text>
        {def.movements.length > 0 ? (
          <Text style={[styles.rowMovements, { color: c.textDim }]} numberOfLines={1}>
            {movementsSummary(def)}
          </Text>
        ) : null}
      </GlassCard>
    </Pressable>
  );
}

/** The WOD library: saved box/custom WODs first, then the canonical benchmarks. */
export default function BenchmarksScreen() {
  const c = useTheme();
  const [myWods, setMyWods] = useState<WodDef[]>([]);

  useFocusEffect(
    useCallback(() => {
      setMyWods(listWods());
    }, []),
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="WOD Library" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {myWods.length > 0 ? (
            <>
              <Text style={[styles.sectionLabel, { color: c.textDim }]}>MY WODS</Text>
              {myWods.map((def) => (
                <WodRow key={def.ref} def={def} />
              ))}
            </>
          ) : null}
          <Text style={[styles.sectionLabel, { color: c.textDim }]}>BENCHMARKS</Text>
          {BENCHMARKS.map((def) => (
            <WodRow key={def.ref} def={def} />
          ))}
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
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginTop: Spacing.sm,
  },
  rowName: {
    fontSize: 17,
    fontWeight: '800',
  },
  rowBlurb: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  rowMovements: {
    fontSize: 12,
    marginTop: 3,
  },
});
