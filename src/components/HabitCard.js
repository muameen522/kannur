import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { colors, fontSize, borderRadius, shadow } from '../constants/theme';
import WeekGrid from './WeekGrid';
import { calculateStreak, getPastWeekDates, dateKey } from '../utils/helpers';

export default function HabitCard({ habit, onCheckin, onPress }) {
  const streak = calculateStreak(habit.logs);
  const weekDates = getPastWeekDates();
  const today = dateKey();
  const todayEntry = habit.logs[today];
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const isBoolean = habit.type === 'boolean';
  const hasCheckedToday = isBoolean
    ? todayEntry === true
    : typeof todayEntry === 'object' && todayEntry.count > 0;
  const volumeProgress = typeof todayEntry === 'object' ? todayEntry.count : 0;
  const volumeComplete = habit.targetCount && volumeProgress >= habit.targetCount;

  function animateAndCheckin() {
    if (isBoolean && hasCheckedToday) return;
    if (habit.type === 'volume' && volumeComplete) return;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 120, useNativeDriver: true }),
    ]).start();

    onCheckin(habit.id);
  }

  const checkBtnDisabled = (isBoolean && hasCheckedToday) || (habit.type === 'volume' && volumeComplete);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress && onPress(habit)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{habit.emoji}</Text>
          <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
          {habit.type === 'volume' && (
            <Text style={styles.typeBadge}>×{habit.targetCount}/d</Text>
          )}
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakNum}>{streak}</Text>
          <Text style={styles.streakLabel}>day</Text>
        </View>
      </View>

      <View style={styles.todaySection}>
        <Text style={styles.todayLabel}>
          {isBoolean
            ? hasCheckedToday ? "Done for today" : "Tap to check in"
            : volumeComplete
              ? "All done today!"
              : `${volumeProgress}/${habit.targetCount} today`}
        </Text>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.checkBtn,
              isBoolean && hasCheckedToday && styles.checkBtnDone,
              habit.type === 'volume' && volumeComplete && styles.checkBtnDone,
            ]}
            onPress={animateAndCheckin}
            disabled={checkBtnDisabled}
            activeOpacity={0.7}
          >
            {isBoolean ? (
              hasCheckedToday ? (
                <Text style={styles.checkEmoji}>✅</Text>
              ) : (
                <Text style={styles.checkEmoji}>⬜</Text>
              )
            ) : volumeComplete ? (
              <Text style={styles.checkEmoji}>✅</Text>
            ) : (
              <View style={styles.volumeRow}>
                <Text style={styles.volumePlus}>+</Text>
                <Text style={styles.volumeCount}>
                  {volumeProgress}/{habit.targetCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.weekContainer}>
        <Text style={styles.weekLabel}>Past 7 days</Text>
        <WeekGrid
          logs={habit.logs}
          habitType={habit.type}
          targetCount={habit.targetCount}
          weekDates={weekDates}
        />
      </View>
    </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  typeBadge: {
    fontSize: fontSize.xs,
    color: colors.accent,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
    overflow: 'hidden',
    fontWeight: '600',
  },
  streakBadge: {
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakNum: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.accent,
    lineHeight: 24,
  },
  streakLabel: {
    fontSize: 9,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: -2,
  },
  todaySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: borderRadius.md,
    marginBottom: 12,
  },
  todayLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  checkBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkBtnDone: {
    backgroundColor: colors.success,
  },
  checkEmoji: {
    fontSize: 24,
  },
  volumeRow: {
    alignItems: 'center',
  },
  volumePlus: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 24,
  },
  volumeCount: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
    marginTop: -2,
  },
  weekContainer: {
    gap: 8,
  },
  weekLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
