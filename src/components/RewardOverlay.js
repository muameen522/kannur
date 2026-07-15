import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, View } from 'react-native';
import { colors, fontSize } from '../constants/theme';

export default function RewardOverlay({ visible, message = 'Nice!', emoji = '🎉', onFinish }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.delay(800),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.5, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]).start(() => onFinish && onFinish());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale }], opacity },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  message: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});
