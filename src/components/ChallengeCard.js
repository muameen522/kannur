import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, borderRadius, shadow } from '../constants/theme';
import { dateKey, getDaysInRange } from '../utils/helpers';

export default function ChallengeCard({ challenge }) {
  const { name, duration, startDate, completed, checkIns } = challenge;
  const days = getDaysInRange(startDate, duration);
  const checkedCount = days.filter((d) => checkIns[d]).length;
  const progress = duration > 0 ? (checkedCount / duration) * 100 : 0;

  return (
    <View style={[styles.card, completed && styles.completedCard]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{completed ? '🏆' : '🔥'}</Text>
          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.subtitle}>
              {completed
                ? 'Completed!'
                : `${checkedCount}/${duration} days`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(progress, 100)}%` },
          ]}
        />
      </View>

      <View style={styles.daysRow}>
        {days.map((d, i) => {
          const checked = !!checkIns[d];
          const today = d === dateKey();
          return (
            <View
              key={d}
              style={[
                styles.dayDot,
                checked && styles.dayDotChecked,
                completed && styles.dayDotCompleted,
                today && !checked && styles.dayDotToday,
              ]}
            >
              <Text
                style={[
                  styles.dayDotText,
                  (checked || completed) && styles.dayDotTextChecked,
                ]}
              >
                {i + 1}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: borderRadius.lg,
    marginBottom: borderRadius.md,
    ...shadow.card,
  },
  completedCard: {
    borderWidth: 1,
    borderColor: colors.successLight,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotChecked: {
    backgroundColor: colors.success,
  },
  dayDotCompleted: {
    backgroundColor: colors.successLight,
  },
  dayDotToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayDotText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  dayDotTextChecked: {
    color: colors.text,
  },
});
