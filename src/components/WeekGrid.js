import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, borderRadius } from '../constants/theme';
import { isToday } from '../utils/helpers';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeekGrid({ logs, habitType, targetCount, weekDates }) {
  function isChecked(date) {
    const entry = logs[date];
    if (!entry) return false;
    if (habitType === 'boolean') return entry === true;
    if (typeof entry === 'object') return entry.count > 0;
    return false;
  }

  function getProgress(date) {
    if (habitType !== 'volume') return null;
    const entry = logs[date];
    if (!entry || typeof entry !== 'object') return null;
    return { current: entry.count || 0, target: targetCount };
  }

  return (
    <View style={styles.weekRow}>
      {weekDates.map((date, i) => {
        const checked = isChecked(date);
        const today = isToday(date);
        const progress = getProgress(date);

        return (
          <View
            key={date}
            style={[
              styles.dayCell,
              checked && styles.dayChecked,
              today && styles.dayToday,
            ]}
          >
            <Text style={[styles.dayLabel, checked && styles.dayLabelChecked]}>
              {DAYS[i]}
            </Text>
            <Text style={[styles.dayNum, checked && styles.dayNumChecked]}>
              {date.split('-')[2]}
            </Text>
            {progress && (
              <Text style={styles.progressText}>
                {progress.current}/{progress.target}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 40,
    height: 52,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  dayChecked: {
    backgroundColor: colors.success,
  },
  dayToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  dayLabelChecked: {
    color: '#a5d6a7',
  },
  dayNum: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '700',
    marginTop: 1,
  },
  dayNumChecked: {
    color: '#fff',
  },
  progressText: {
    fontSize: 8,
    color: '#a5d6a7',
    marginTop: 1,
    fontWeight: '600',
  },
});
