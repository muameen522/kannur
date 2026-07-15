import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  habits: '@myapp_habits',
  challenges: '@myapp_challenges',
  settings: '@myapp_settings',
  onboarding: '@myapp_onboarding',
};

export async function loadData(key) {
  try {
    const json = await AsyncStorage.getItem(KEYS[key]);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export async function saveData(key, data) {
  try {
    await AsyncStorage.setItem(KEYS[key], JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export async function clearAll() {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
    return true;
  } catch {
    return false;
  }
}
