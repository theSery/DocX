import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAuthTokens } from '../api/tokenStorage';
import { clearUserCredentials } from './secureStorage';
import { STORAGE_KEYS } from './storageKeys';

/**
 * Keychain data can survive app uninstall on iOS. AsyncStorage is always wiped.
 * If the install marker is missing but other app data exists, this is an upgrade
 * from a version without the marker — preserve credentials and set the marker.
 * If the marker is missing and no app data exists, treat as fresh install or
 * reinstall and wipe all keychain credentials.
 */
export async function clearCredentialsIfReinstalled() {
  const [marker, onboarding, sign] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.APP_INSTALLED),
    AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
    AsyncStorage.getItem(STORAGE_KEYS.SIGN),
  ]);

  if (marker === 'true') {
    return;
  }

  const hasExistingAppData = onboarding != null || sign != null;

  if (hasExistingAppData) {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_INSTALLED, 'true');
    return;
  }

  await Promise.all([clearAuthTokens(), clearUserCredentials()]);
  await AsyncStorage.setItem(STORAGE_KEYS.APP_INSTALLED, 'true');
}
