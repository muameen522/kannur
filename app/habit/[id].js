import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { colors, fontSize, spacing, borderRadius, shadow } from '../../src/constants/theme';
import { lightTap, successNotification, celebrate, heavyTap } from '../../src/utils/haptics';
import { playSuccess } from '../../src/utils/sounds';
import {
  dateKey,
  calculateStreak,
  calculateBestStreak,
  totalCompletions,
  weeklyCompletionRate,
  getPastWeekDates,
} from '../../src/utils/helpers';
import WeekGrid from '../../src/components/WeekGrid';
import ConsistencyChart from '../../src/components/ConsistencyChart';
import RewardOverlay from '../../src/components/RewardOverlay';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { state, checkHabit, deleteHabit } = useApp();
  const habit = state.habits.find((h) => h.id === id);
  const [rewardVisible, setRewardVisible] = useState(false);
  const [scaleAnim] = useState(() => new Animated.Value(1));

  if (!habit) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Habit not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const today = dateKey();
  const todayEntry = habit.logs[today];
  const isBoolean = habit.type === 'boolean';
  const hasCheckedToday = isBoolean ? todayEntry === true : typeof todayEntry === 'object' && todayEntry.count > 0;
  const volProgress = typeof todayEntry === 'object' ? todayEntry.count : 0;
  const volComplete = habit.type === 'volume' && habit.targetCount && volProgress >= habit.targetCount;

  const streak = calculateStreak(habit.logs);
  const bestStreak = calculateBestStreak(habit.logs);
  const total = totalCompletions(habit.logs);
  const weeklyRate = weeklyCompletionRate(habit.logs);
  const weekDates = getPastWeekDates();

  function handleCheckin() {
    if (isBoolean && hasCheckedToday) return;
    if (habit.type === 'volume' && volComplete) return;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 120, useNativeDriver: true }),
    ]).start();

    checkHabit(habit.id, today);
    lightTap();
    successNotification();
    playSuccess();

    setRewardVisible(true);

    if (habit.type === 'volume') {
      const newCount = volProgress + 1;
      if (newCount >= habit.targetCount) {
        celebrate();
      }
    }
  }

  function handleDelete() {
    Alert.alert('Delete Habit', `Delete "${habit.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          heavyTap();
          deleteHabit(habit.id);
          router.back();
        },
      },
    ]);
  }

  const checkDisabled = (isBoolean && hasCheckedToday) || (habit.type === 'volume' && volComplete);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Habit Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{habit.emoji}</Text>
          <Text style={styles.heroName}>{habit.name}</Text>
          {habit.type === 'volume' && (
            <Text style={styles.heroType}>×{habit.targetCount} per day</Text>
          )}
        </View>

        <View style={styles.todayCard}>
          <Text style={styles.todayHeading}>
            {isBoolean
              ? hasCheckedToday ? "Done for today" : "Check in for today"
              : volComplete
                ? "All done today"
                : `${volProgress}/${habit.targetCount} today`}
          </Text>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.bigCheckBtn, checkDisabled && styles.bigCheckBtnDone]}
              onPress={handleCheckin}
              disabled={checkDisabled}
              activeOpacity={0.7}
            >
              <Text style={styles.bigCheckEmoji}>
                {isBoolean
                  ? hasCheckedToday ? '✅' : '⬜'
                  : volComplete ? '✅' : '🔄'}
              </Text>
              <Text style={styles.bigCheckLabel}>
                {isBoolean
                  ? hasCheckedToday ? 'Done' : 'Tap to check'
                  : volComplete
                    ? 'Complete'
                    : `+ add (${volProgress}/${habit.targetCount})`}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{streak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{weeklyRate}%</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{total}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past 7 Days</Text>
          <WeekGrid
            logs={habit.logs}
            habitType={habit.type}
            targetCount={habit.targetCount}
            weekDates={weekDates}
          />
        </View>

        <ConsistencyChart logs={habit.logs} days={30} />

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete Habit</Text>
        </TouchableOpacity>
      </ScrollView>

      <RewardOverlay
        visible={rewardVisible}
        message={
          habit.type === 'volume' && volProgress + 1 >= habit.targetCount
            ? 'Target complete!'
            : 'Checked in!'
        }
        emoji={
          habit.type === 'volume' && volProgress + 1 >= habit.targetCount
            ? '🎯'
            : '✅'
        }
        onFinish={() => setRewardVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'web' ? 20 : 60,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  backBtn: {
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  backBtnText: {
    color: colors.text,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 18,
    color: colors.text,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroEmoji: {
    fontSize: 56,
    marginBottom: 6,
  },
  heroName: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  heroType: {
    fontSize: fontSize.md,
    color: colors.accent,
    marginTop: 4,
    fontWeight: '600',
  },
  todayCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadow.card,
  },
  todayHeading: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  bigCheckBtn: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigCheckBtnDone: {
    backgroundColor: colors.success,
  },
  bigCheckEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  bigCheckLabel: {
    fontSize: fontSize.xs,
    color: '#fff',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.card,
  },
  statNum: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  deleteBtn: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: '#2a1a1a',
    borderWidth: 1,
    borderColor: colors.danger,
    marginTop: spacing.lg,
  },
  deleteBtnText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.danger,
  },
});
