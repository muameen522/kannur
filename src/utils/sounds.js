import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let successSound = null;

export async function loadSounds() {
  if (Platform.OS === 'web') return;
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
      { shouldPlay: false }
    );
    successSound = sound;
  } catch {}
}

export async function playSuccess() {
  if (Platform.OS === 'web') return;
  try {
    if (successSound) {
      await successSound.replayAsync();
    }
  } catch {}
}

export async function unloadSounds() {
  if (successSound) {
    await successSound.unloadAsync();
    successSound = null;
  }
}

export function useReward() {
  return {
    trigger: async () => {
      playSuccess();
    },
  };
}
