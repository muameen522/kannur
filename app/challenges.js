import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import { colors, fontSize, spacing, borderRadius, shadow } from '../src/constants/theme';
import ChallengeCard from '../src/components/ChallengeCard';
import { successNotification, lightTap, mediumTap } from '../src/utils/haptics';
import { playSuccess } from '../src/utils/sounds';

const PRESET_CHALLENGES = [
  { name: '3-Day Jumpstart', duration: 3, desc: 'Kickstart your habit journey', emoji: '🚀' },
  { name: '7-Day Foundation', duration: 7, desc: 'Build a solid week of consistency', emoji: '💪' },
  { name: '14-Day Challenge', duration: 14, desc: 'Two weeks to form the habit', emoji: '🔥' },
  { name: '21-Day Commitment', duration: 21, desc: 'The habit formation milestone', emoji: '🎯' },
  { name: '30-Day Mastery', duration: 30, desc: 'Full month of discipline', emoji: '🏆' },
];

export default function ChallengesScreen() {
  const router = useRouter();
  const { state, addChallenge } = useApp();
  const { challenges, habits } = state;

  const activeChallenges = challenges.filter((c) => !c.completed);
  const completedChallenges = challenges.filter((c) => c.completed);

  function handleStartChallenge(preset) {
    mediumTap();
    addChallenge({
      name: preset.name,
      duration: preset.duration,
    });
    successNotification();
    playSuccess();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Challenges</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Challenges</Text>
            {activeChallenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start a Challenge</Text>
          <Text style={styles.sectionDesc}>
            Challenges help you stay accountable. Pick one and commit!
          </Text>
          {PRESET_CHALLENGES.map((preset) => {
            const alreadyRunning = activeChallenges.some(
              (c) => c.name === preset.name
            );
            return (
              <TouchableOpacity
                key={preset.name}
                style={[styles.presetCard, alreadyRunning && styles.presetCardDisabled]}
                onPress={() => handleStartChallenge(preset)}
                disabled={alreadyRunning}
                activeOpacity={0.7}
              >
                <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                <View style={styles.presetInfo}>
                  <Text style={styles.presetName}>{preset.name}</Text>
                  <Text style={styles.presetDesc}>{preset.desc}</Text>
                  <Text style={styles.presetDuration}>
                    {preset.duration} {preset.duration === 1 ? 'day' : 'days'}
                  </Text>
                </View>
                {alreadyRunning ? (
                  <Text style={styles.presetStatus}>Active</Text>
                ) : (
                  <Text style={styles.presetStart}>Start</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {completedChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed 🏆</Text>
            {completedChallenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </View>
        )}

        {challenges.length === 0 && habits.length > 0 && (
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              Challenges work best when you add habits to them. Create a habit first, then
              start a challenge to pair with it!
            </Text>
          </View>
        )}
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 18,
    color: colors.text,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  presetCardDisabled: {
    opacity: 0.5,
  },
  presetEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  presetDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  presetDuration: {
    fontSize: fontSize.xs,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 2,
  },
  presetStatus: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.successLight,
  },
  presetStart: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
