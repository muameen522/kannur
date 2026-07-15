import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  habits: '@cache_habits',
  challenges: '@cache_challenges',
  settings: '@cache_settings',
  onboarding: '@cache_onboarding',
  user: '@cache_user',
};

export async function loadFromCache(key) {
  try {
    const json = await AsyncStorage.getItem(CACHE_KEYS[key]);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export async function saveToCache(key, data) {
  try {
    await AsyncStorage.setItem(CACHE_KEYS[key], JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export async function clearCache() {
  try {
    await AsyncStorage.multiRemove(Object.values(CACHE_KEYS));
    return true;
  } catch {
    return false;
  }
}

export async function loadAllFromCache() {
  const [habits, challenges, settings, user] = await Promise.all([
    loadFromCache('habits'),
    loadFromCache('challenges'),
    loadFromCache('settings'),
    loadFromCache('user'),
  ]);
  return { habits, challenges, settings, user };
}

export async function saveAllToCache(data) {
  const ops = [];
  if (data.habits) ops.push(saveToCache('habits', data.habits));
  if (data.challenges) ops.push(saveToCache('challenges', data.challenges));
  if (data.settings) ops.push(saveToCache('settings', data.settings));
  if (data.user) ops.push(saveToCache('user', data.user));
  await Promise.all(ops);
}
