import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface DateFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

function labelFor(d: Date): string {
  const today = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(today) - startOfDay(d)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/** Tappable date row that reveals an inline calendar (change #2). */
export function DateField({ label, value, onChange }: DateFieldProps) {
  const c = useTheme();
  const scheme = useColorScheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          setOpen((o) => !o);
        }}
        style={[styles.row, { backgroundColor: c.surfaceSolid, borderColor: open ? c.accent : c.border }]}>
        <Text style={[styles.label, { color: c.textDim }]}>{label}</Text>
        <View style={styles.value}>
          <Ionicons name="calendar-outline" size={16} color={c.accent} />
          <Text style={[styles.valueText, { color: c.text }]}>{labelFor(value)}</Text>
        </View>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date()}
          accentColor={c.accent}
          themeVariant={scheme === 'light' ? 'light' : 'dark'}
          onChange={(event, date) => {
            if (Platform.OS !== 'ios') setOpen(false);
            if (event.type === 'set' && date) onChange(date);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
