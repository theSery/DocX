import { Linking } from 'react-native';

import { showGlobalSheet } from '../components/GlobalSheet';
import SettingSvg from '../components/icons/SettingSvg';
import { palette } from '../theme';
import { isBiometricSupported } from './secureStorage';

export const BIOMETRIC_SETTINGS_MESSAGE =
  'Հավելվածն անվտանգ և հարմարավետ օգտագործելու համար խորհուրդ ենք տալիս միացնել Face ID-ն հավելվածի կարգավորումներից։';

/**
 * Opens the OS app settings page (iOS & Android).
 */
export async function openAppSettings() {
  await Linking.openSettings();
}

/**
 * Shows a bottom sheet prompting the user to enable Face ID in App Settings.
 */
export function showBiometricPermissionSheet() {
  showGlobalSheet({
    message: BIOMETRIC_SETTINGS_MESSAGE,
    actions: [
      {
        label: 'Հավելվածի կարգավորումներ',
        icon: <SettingSvg width={20} height={20} fill={palette.white} />,
        onPress: () => {
          openAppSettings();
        },
      },
    ],
  });
}

/**
 * Central Face ID / biometric gate used wherever FaceIdIcon can be pressed.
 * @returns {Promise<boolean>} true when biometrics are available and auth may proceed
 */
export async function ensureBiometricPermission() {
  const available = await isBiometricSupported();
  if (available) {
    return true;
  }

  showBiometricPermissionSheet();
  return false;
}

/**
 * Runs `onAuthenticated` only when biometric hardware/permission is available.
 * Otherwise opens the App Settings sheet and does not start biometric auth.
 * @param {() => void | Promise<void>} onAuthenticated
 * @returns {Promise<boolean>} whether biometric auth was started
 */
export async function runBiometricOrPromptSettings(onAuthenticated) {
  const allowed = await ensureBiometricPermission();
  if (!allowed) {
    return false;
  }

  await onAuthenticated?.();
  return true;
}
