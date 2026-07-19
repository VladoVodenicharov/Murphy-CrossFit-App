import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { GradientBackground } from '@/components/gradient-background';
import { BottomTabInset, Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, formatGymScore, formatScore, sessionTitle } from '@/lib/format';
import { listAllHistory, type HistoryItem } from '@/lib/history';
import { GYM_KIND_LABEL, WOD_FORMAT_LABEL } from '@/lib/types';

export default function HistoryScreen() {
  const c = useTheme();
  const [items, setItems] = useState<HistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      setItems(listAllHistory());
    }, []),
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.overline, { color: c.accent }]}>MURPHY</Text>
          <Text style={[styles.title, { color: c.text }]}>History</Text>
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => `${item.type}-${item.row.id}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            items.length > 0 ? (
              <Text style={[styles.hint, { color: c.textFaint }]}>Tap a workout to edit or delete it.</Text>
            ) : null
          }
          ListEmptyComponent={
            <GlassCard style={styles.emptyCard}>
              <Text style={[styles.emptyTitle, { color: c.text }]}>Nothing logged yet</Text>
              <Text style={[styles.emptyBody, { color: c.textDim }]}>
                Your logged workouts land here — go earn the first one.
              </Text>
            </GlassCard>
          }
          renderItem={({ item }) => {
            const isWod = item.type === 'wod';
            const name = isWod ? item.row.wod_name : sessionTitle(item.row);
            const meta = isWod
              ? `${WOD_FORMAT_LABEL[item.row.wod_format]} · ${formatDate(item.row.performed_at)}`
              : `${GYM_KIND_LABEL[item.row.kind]} · ${formatDate(item.row.performed_at)}`;
            const score = isWod ? formatScore(item.row) : formatGymScore(item.row);

            return (
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  if (isWod) {
                    router.push({ pathname: '/log', params: { resultId: String(item.row.id) } });
                  } else {
                    router.push({
                      pathname: item.row.kind === 'strength' ? '/gym-strength' : '/gym-cardio',
                      params: { logId: String(item.row.id) },
                    });
                  }
                }}
                style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}>
                <GlassCard>
                  <View style={styles.rowInner}>
                    <View style={styles.rowLeft}>
                      <Text style={[styles.rowName, { color: c.text }]} numberOfLines={1}>
                        {name}
                      </Text>
                      <Text style={[styles.rowMeta, { color: c.textDim }]} numberOfLines={1}>
                        {meta}
                      </Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={[styles.rowScore, { color: c.accent }]}>{score}</Text>
                      {isWod ? (
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: item.row.is_rx ? c.goodSoft : c.warnSoft },
                          ]}>
                          <Text style={[styles.badgeText, { color: item.row.is_rx ? c.good : c.warn }]}>
                            {item.row.is_rx ? 'RX' : 'SCALED'}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={c.textFaint} />
                  </View>
                </GlassCard>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  overline: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: BottomTabInset + Spacing.lg,
    gap: Spacing.sm,
    flexGrow: 1,
  },
  hint: {
    fontSize: 12.5,
    marginBottom: Spacing.xs,
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
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowLeft: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '800',
  },
  rowMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rowScore: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Fonts?.rounded,
    fontVariant: ['tabular-nums'],
  },
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
