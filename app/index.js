import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import { colors, fontSize, spacing, borderRadius, shadow } from '../src/constants/theme';
import HabitCard from '../src/components/HabitCard';
import RewardOverlay from '../src/components/RewardOverlay';
import { dateKey, getGreeting } from '../src/utils/helpers';
import { lightTap, successNotification, celebrate } from '../src/utils/haptics';
import { playSuccess } from '../src/utils/sounds';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function HomeScreen() {
  const router = useRouter();
  const { state, checkHabit } = useApp();
  const { habits, challenges, onboardingComplete, user, loaded } = state;

  const [rewardVisible, setRewardVisible] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const [rewardEmoji, setRewardEmoji] = useState('');
  const [fabScale] = useState(() => new Animated.Value(1));

  const today = new Date();
  const todayStr = dateKey();

  const pulseFab = useCallback(() => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (!user) {
      router.replace('/auth');
      return;
    }
    if (!onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [user, onboardingComplete, loaded]);

  if (!loaded || !user) return null;

  function showReward(message, emoji) {
    setRewardMessage(message);
    setRewardEmoji(emoji);
    setRewardVisible(true);
  }

  function handleCheckin(habitId) {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const isBoolean = habit.type === 'boolean';
    const todayEntry = habit.logs[todayStr];

    if (isBoolean && todayEntry === true) return;

    const volCount = typeof todayEntry === 'object' ? todayEntry.count : 0;
    if (!isBoolean && volCount >= habit.targetCount) return;

    checkHabit(habitId, todayStr);

    lightTap();
    successNotification();
    playSuccess();

    if (!isBoolean) {
      const newCount = volCount + 1;
      if (newCount >= habit.targetCount) {
        celebrate();
        showReward('Target complete!', '🎯');
        return;
      }
      showReward(`${newCount}/${habit.targetCount}`, '✅');
      return;
    }

    showReward('Checked in!', '✅');
  }

  function handleHabitPress(habit) {
    router.push(`/habit/${habit.id}`);
  }

  const activeChallenge = challenges.find((c) => !c.completed);
  const todayDone = habits.filter(
    (h) =>
      h.logs[todayStr] === true ||
      (typeof h.logs[todayStr] === 'object' && h.logs[todayStr].count > 0)
  ).length;
  const todayComplete = habits.filter((h) => {
    if (h.type === 'boolean') return h.logs[todayStr] === true;
    const entry = h.logs[todayStr];
    return typeof entry === 'object' && entry.count >= h.targetCount;
  }).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>
            {DAYS[today.getDay()]}, {MONTHS[today.getMonth()]} {today.getDate()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {activeChallenge && (
        <TouchableOpacity
          style={styles.challengeBanner}
          onPress={() => router.push('/challenges')}
          activeOpacity={0.7}
        >
          <Text style={styles.challengeBannerIcon}>🔥</Text>
          <View style={styles.challengeBannerText}>
            <Text style={styles.challengeBannerTitle}>{activeChallenge.name}</Text>
            <Text style={styles.challengeBannerSub}>Tap to view progress</Text>
          </View>
          <Text style={styles.challengeBannerArrow}>›</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HabitCard habit={item} onCheckin={handleCheckin} onPress={handleHabitPress} />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          habits.length > 0 ? (
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{habits.length}</Text>
                <Text style={styles.statLabel}>Habits</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{todayDone}</Text>
                <Text style={styles.statLabel}>Active Today</Text>
              </View>
              <TouchableOpacity style={styles.stat} onPress={() => router.push('/challenges')}>
                <Text style={styles.statNum}>{challenges.length}</Text>
                <Text style={styles.statLabel}>Challenges</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySub}>
              Tap + to create your first habit and start building consistency!
            </Text>
          </View>
        }
      />

      <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            pulseFab();
            router.push('/create-habit');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      <RewardOverlay
        visible={rewardVisible}
        message={rewardMessage}
        emoji={rewardEmoji}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  date: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  challengeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  challengeBannerIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  challengeBannerText: {
    flex: 1,
  },
  challengeBannerTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.accent,
  },
  challengeBannerSub: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 1,
  },
  challengeBannerArrow: {
    fontSize: 24,
    color: colors.textMuted,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stat: {
    flex: 1,
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
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.fab,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 30,
    fontWeight: '300',
  },
});
