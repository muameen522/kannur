import { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import { colors, fontSize, spacing, borderRadius } from '../src/constants/theme';
import { mediumTap, heavyTap } from '../src/utils/haptics';
import { requestPermissions, scheduleDailyReminder } from '../src/utils/notifications';

const { width } = Dimensions.get('window');

const slides = [
  {
    emoji: '🌱',
    title: 'Build Better Habits',
    desc: 'Create habits that stick. Simple daily check-ins help you build consistency, one day at a time.',
  },
  {
    emoji: '🔥',
    title: 'Stay on a Streak',
    desc: 'Every check-in adds to your streak. Watch it grow and feel the satisfaction of showing up every day.',
  },
  {
    emoji: '🏆',
    title: 'Take on Challenges',
    desc: 'Push yourself with 3, 7, or 30-day challenges. Turn your habits into real achievements.',
  },
  {
    emoji: '📊',
    title: 'Track Your Progress',
    desc: 'See your consistency over time with charts and stats. Know exactly how you are doing.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboarding, addChallenge } = useApp();
  const [slideIndex, setSlideIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function nextSlide() {
    if (slideIndex < slides.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setSlideIndex(slideIndex + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }

  function prevSlide() {
    if (slideIndex > 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setSlideIndex(slideIndex - 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }

  async function handleFinish() {
    mediumTap();
    setOnboarding(true);

    const granted = await requestPermissions();
    if (granted) {
      await scheduleDailyReminder(9, 0);
    }

    router.replace('/');
  }

  async function handleQuickChallenge() {
    mediumTap();
    addChallenge({
      name: '3-Day Jumpstart',
      duration: 3,
    });
    heavyTap();
    await handleFinish();
  }

  const slide = slides[slideIndex];
  const isLast = slideIndex === slides.length - 1;
  const isFirst = slideIndex === 0;

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        {!isFirst && (
          <TouchableOpacity style={styles.skipBtn} onPress={prevSlide}>
            <Text style={styles.skipText}>← Back</Text>
          </TouchableOpacity>
        )}
        {isFirst && (
          <TouchableOpacity style={styles.skipBtn} onPress={handleFinish}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <Animated.View style={[styles.slideContent, { opacity: fadeAnim }]}>
        <Text style={styles.slideEmoji}>{slide.emoji}</Text>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDesc}>{slide.desc}</Text>
      </Animated.View>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === slideIndex && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.bottomSection}>
        {!isLast ? (
          <TouchableOpacity style={styles.nextBtn} onPress={nextSlide}>
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.startBtn} onPress={handleQuickChallenge}>
              <Text style={styles.startBtnText}>🚀 Start 3-Day Challenge</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipBtnBottom}
              onPress={handleFinish}
            >
              <Text style={styles.skipBtnBottomText}>Start fresh, no challenge</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'web' ? 40 : 80,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xxl,
    height: 40,
  },
  skipBtn: {
    padding: spacing.sm,
  },
  skipText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: '600',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  slideEmoji: {
    fontSize: 80,
    marginBottom: spacing.xxl,
  },
  slideTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideDesc: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.xxxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  bottomSection: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: Platform.OS === 'web' ? 40 : 60,
    alignItems: 'center',
  },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: 60,
    alignItems: 'center',
    width: '100%',
  },
  nextBtnText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  startBtn: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  startBtnText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#000000',
  },
  skipBtnBottom: {
    padding: spacing.md,
  },
  skipBtnBottomText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
