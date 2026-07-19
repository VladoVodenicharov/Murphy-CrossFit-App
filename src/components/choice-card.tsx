import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ChoiceCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  badge?: string;
}

/** Big tappable entry point on the Home hub. */
export function ChoiceCard({ icon, title, subtitle, onPress, badge }: ChoiceCardProps) {
  const c = useTheme();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      <GlassCard>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: c.accentSoft }]}>
            <Ionicons name={icon} size={23} color={c.accent} />
          </View>
          <View style={styles.textWrap}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: c.text }]}>{title}</Text>
              {badge ? (
                <View style={[styles.badge, { backgroundColor: c.accentSoft }]}>
                  <Text style={[styles.badgeText, { color: c.accent }]}>{badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.subtitle, { color: c.textDim }]}>{subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color={c.textFaint} />
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
});
