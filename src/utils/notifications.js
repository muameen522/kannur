import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions() {
  if (Platform.OS === 'web') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(hour, minute, habitName) {
  if (Platform.OS === 'web') return;
  await cancelAllReminders();

  const title = habitName ? `Time for ${habitName}!` : 'Time for your habits!';
  const body = habitName
    ? "Don't break your streak!"
    : 'Check in on your habits and keep the streak alive!';

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function scheduleChallengeReminder(hour, minute) {
  if (Platform.OS === 'web') return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Challenge Check-in',
      body: 'Your challenge is waiting! Stay consistent!',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelAllReminders() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function setupNotificationCategories() {
  if (Platform.OS === 'web') return;
  await Notifications.setNotificationCategoryAsync('habit_checkin', [
    {
      identifier: 'checkin',
      buttonTitle: 'Check in',
      options: { opensAppToForeground: true },
    },
    {
      identifier: 'later',
      buttonTitle: 'Remind later',
      options: { opensAppToForeground: false },
    },
  ]);
}
