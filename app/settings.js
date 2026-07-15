import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../src/context/AppContext';
import { colors, fontSize, spacing, borderRadius, shadow } from '../src/constants/theme';
import { mediumTap } from '../src/utils/haptics';
import { requestPermissions, scheduleDailyReminder, cancelAllReminders } from '../src/utils/notifications';
import { clearAll } from '../src/utils/storage';

const TIMES = [
  { label: 'Morning', hour: 8, minute: 0 },
  { label: 'Midday', hour: 12, minute: 0 },
  { label: 'Afternoon', hour: 15, minute: 0 },
  { label: 'Evening', hour: 18, minute: 0 },
  { label: 'Night', hour: 21, minute: 0 },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { state, setSettings, setOnboarding } = useApp();
  const { notificationsEnabled, notificationTime } = state;

  const [notifEnabled, setNotifEnabled] = useState(notificationsEnabled);
  const [selectedTime, setSelectedTime] = useState(notificationTime || '09:00');

  async function toggleNotifications(val) {
    mediumTap();
    setNotifEnabled(val);
    setSettings({ notificationsEnabled: val });

    if (val) {
      const granted = await requestPermissions();
      if (granted) {
        const [h, m] = selectedTime.split(':').map(Number);
        await scheduleDailyReminder(h, m || 0);
      } else {
        setNotifEnabled(false);
        setSettings({ notificationsEnabled: false });
        Alert.alert('Permission Denied', 'Enable notifications in your device settings.');
      }
    } else {
      await cancelAllReminders();
    }
  }

  async function handleTimeSelect(timeStr) {
    mediumTap();
    setSelectedTime(timeStr);
    setSettings({ notificationTime: timeStr });

    if (notifEnabled) {
      const [h, m] = timeStr.split(':').map(Number);
      await scheduleDailyReminder(h, m || 0);
    }
  }

  function handleReset() {
    Alert.alert(
      'Reset All Data',
      'This will delete all habits, challenges, and settings. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            setOnboarding(false);
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Text style={styles.sectionDesc}>
            Get daily reminders to check in on your habits
          </Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Daily Reminder</Text>
              <Text style={styles.settingDesc}>
                {notifEnabled ? `At ${selectedTime}` : 'Off'}
              </Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.surfaceLight, true: colors.primary }}
              thumbColor={notifEnabled ? colors.text : colors.textMuted}
            />
          </View>

          {notifEnabled && (
            <>
              <Text style={styles.timeLabel}>Reminder Time</Text>
              <View style={styles.timeRow}>
                {TIMES.map((t) => {
                  const timeStr = `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
                  const isActive = selectedTime === timeStr;
                  return (
                    <TouchableOpacity
                      key={timeStr}
                      style={[styles.timeBtn, isActive && styles.timeBtnActive]}
                      onPress={() => handleTimeSelect(timeStr)}
                    >
                      <Text
                        style={[styles.timeLabel, isActive && styles.timeLabelActive]}
                      >
                        {t.label}
                      </Text>
                      <Text
                        style={[styles.timeValue, isActive && styles.timeValueActive]}
                      >
                        {timeStr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Framework</Text>
            <Text style={styles.aboutValue}>Expo SDK 57</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>Reset All Data</Text>
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
    marginBottom: spacing.xxxl,
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
    marginBottom: spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  settingDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timeLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  timeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 70,
  },
  timeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  timeLabelActive: {
    color: colors.text,
  },
  timeValue: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  timeValueActive: {
    color: '#a0c0ff',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aboutLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  aboutValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  resetBtn: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: '#2a1a1a',
    borderWidth: 1,
    borderColor: colors.danger,
    marginTop: spacing.xl,
  },
  resetBtnText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.danger,
  },
});
