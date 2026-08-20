import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';

export const SMS_RESEND_COOLDOWN_MS = 2 * 60 * 1000;

export async function startSmsResendCooldown(phoneNumber) {
  await AsyncStorage.setItem(
    STORAGE_KEYS.SMS_RESEND_COOLDOWN,
    JSON.stringify({
      phoneNumber,
      sentAt: Date.now(),
    }),
  );
}

export async function getSmsResendRemainingSeconds(phoneNumber) {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SMS_RESEND_COOLDOWN);
  if (!raw) {
    return 0;
  }

  try {
    const { phoneNumber: storedPhone, sentAt } = JSON.parse(raw);
    if (!storedPhone || storedPhone !== phoneNumber || !sentAt) {
      return 0;
    }

    const remainingMs = SMS_RESEND_COOLDOWN_MS - (Date.now() - sentAt);
    return Math.max(0, Math.ceil(remainingMs / 1000));
  } catch {
    return 0;
  }
}

export function formatSmsResendCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
