import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import { colors, fontSize, spacing, borderRadius, shadow, habitEmojis } from '../src/constants/theme';
import { lightTap, mediumTap } from '../src/utils/haptics';

export default function CreateHabitScreen() {
  const router = useRouter();
  const { addHabit } = useApp();

  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(habitEmojis[0]);
  const [type, setType] = useState('boolean');
  const [targetCount, setTargetCount] = useState('3');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    mediumTap();
    addHabit({
      name: trimmed,
      emoji: selectedEmoji,
      type,
      targetCount: type === 'volume' ? parseInt(targetCount, 10) || 3 : null,
    });

    router.back();
  }

  const isValid = name.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Habit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.emojiSelector}
          onPress={() => {
            lightTap();
            setShowEmojiPicker(!showEmojiPicker);
          }}
        >
          <Text style={styles.emojiPreview}>{selectedEmoji}</Text>
          <Text style={styles.emojiLabel}>Tap to change</Text>
        </TouchableOpacity>

        {showEmojiPicker && (
          <View style={styles.emojiGrid}>
            {habitEmojis.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiItem,
                  selectedEmoji === emoji && styles.emojiItemSelected,
                ]}
                onPress={() => {
                  setSelectedEmoji(emoji);
                  setShowEmojiPicker(false);
                  lightTap();
                }}
              >
                <Text style={styles.emojiChar}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Habit Name</Text>
          <TextInput
            style={styles.input}
            placeholder='e.g. "Meditate", "Drink water"'
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Habit Type</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'boolean' && styles.typeBtnActive]}
              onPress={() => {
                setType('boolean');
                lightTap();
              }}
            >
              <Text style={styles.typeIcon}>✅</Text>
              <Text style={[styles.typeLabel, type === 'boolean' && styles.typeLabelActive]}>
                Once daily
              </Text>
              <Text style={styles.typeDesc}>Check in once per day</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, type === 'volume' && styles.typeBtnActive]}
              onPress={() => {
                setType('volume');
                lightTap();
              }}
            >
              <Text style={styles.typeIcon}>📊</Text>
              <Text style={[styles.typeLabel, type === 'volume' && styles.typeLabelActive]}>
                Multiple times
              </Text>
              <Text style={styles.typeDesc}>Track volume per day</Text>
            </TouchableOpacity>
          </View>
        </View>

        {type === 'volume' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Daily Target (times per day)</Text>
            <View style={styles.counterRow}>
              {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.counterBtn,
                    parseInt(targetCount) === n && styles.counterBtnActive,
                  ]}
                  onPress={() => {
                    setTargetCount(String(n));
                    lightTap();
                  }}
                >
                  <Text
                    style={[
                      styles.counterText,
                      parseInt(targetCount) === n && styles.counterTextActive,
                    ]}
                  >
                    ×{n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.createBtn, !isValid && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={!isValid}
          activeOpacity={0.8}
        >
          <Text style={styles.createBtnText}>Create Habit</Text>
        </TouchableOpacity>
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
    paddingBottom: spacing.lg,
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
    fontWeight: '600',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: spacing.xl,
  },
  emojiSelector: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  emojiPreview: {
    fontSize: 56,
    marginBottom: 4,
  },
  emojiLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  emojiItem: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  emojiItemSelected: {
    backgroundColor: colors.primary,
  },
  emojiChar: {
    fontSize: 22,
  },
  inputGroup: {
    marginBottom: spacing.xxl,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.lg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeBtnActive: {
    borderColor: colors.primary,
    backgroundColor: '#000000',
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  typeLabelActive: {
    color: colors.text,
  },
  typeDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  counterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  counterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  counterText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  counterTextActive: {
    color: colors.text,
  },
  createBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createBtnText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
});
