import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

import { STORAGE_KEYS } from './storageKeys';

const KEYCHAIN_SERVICE = 'com.docx.userCredentials';
const PIN_SERVICE = 'com.docx.userPin';
const BIOMETRIC_GATE_SERVICE = 'com.docx.biometricGate';
const EMAIL_SERVICE = 'com.docx.userEmail';

const AUTH_PROMPT = {
  title: 'Նույնականացում',
  subtitle: 'Մուտք գործելու համար օգտագործեք Face ID կամ Touch ID',
  description: 'Մուտք գործելու համար օգտագործեք Face ID կամ Touch ID',
  cancel: 'Չեղարկել',
};

function buildSetOptions(service = KEYCHAIN_SERVICE) {
  return {
    service,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
}

function buildBiometricGateOptions() {
  const options = {
    service: BIOMETRIC_GATE_SERVICE,
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    authenticationPrompt: AUTH_PROMPT,
  };

  if (Platform.OS === 'android') {
    options.storage = Keychain.STORAGE_TYPE.AES_GCM;
  }

  return options;
}

async function saveBiometricGate() {
  const biometrySupported = await isBiometricSupported();
  if (!biometrySupported) {
    await Keychain.resetGenericPassword({ service: BIOMETRIC_GATE_SERVICE });
    return;
  }

  await Keychain.resetGenericPassword({ service: BIOMETRIC_GATE_SERVICE });
  await Keychain.setGenericPassword('gate', '1', buildBiometricGateOptions());
}

async function unlockBiometricGate() {
  const result = await Keychain.getGenericPassword({
    service: BIOMETRIC_GATE_SERVICE,
    authenticationPrompt: AUTH_PROMPT,
  });

  return Boolean(result);
}

export async function getBiometryType() {
  return Keychain.getSupportedBiometryType();
}

export async function isBiometricSupported() {
  const biometryType = await getBiometryType();
  return biometryType != null;
}

export async function hasStoredCredentials() {
  return Keychain.hasGenericPassword({ service: KEYCHAIN_SERVICE });
}

/**
 * Persist email outside biometric-protected credential storage.
 * Used by recovery screens that must never trigger Face ID.
 */
export async function saveStoredEmail(email) {
  if (!email) {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER_EMAIL),
      Keychain.resetGenericPassword({ service: EMAIL_SERVICE }),
    ]);
    return;
  }

  const normalized = String(email).trim();
  await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, normalized);
  await Keychain.setGenericPassword('email', normalized, buildSetOptions(EMAIL_SERVICE));
}

/**
 * Read email without Face ID / biometric prompts.
 * Never reads the biometric-protected credentials blob directly when it may
 * still use legacy biometric ACL (no biometric gate present).
 */
export async function getStoredEmail() {
  const cached = await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
  if (cached) {
    return cached;
  }

  const emailItem = await Keychain.getGenericPassword({
    service: EMAIL_SERVICE,
  });
  if (emailItem?.password) {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, emailItem.password);
    return emailItem.password;
  }

  // New credential model: biometric gate exists ⇒ main credentials are not
  // Face ID protected, so username (email) can be read safely.
  const gateExists = await Keychain.hasGenericPassword({
    service: BIOMETRIC_GATE_SERVICE,
  });
  if (!gateExists) {
    return null;
  }

  try {
    const credentials = await getStoredCredentials();
    if (credentials?.email) {
      await saveStoredEmail(credentials.email);
      return credentials.email;
    }
  } catch (error) {
    console.log('getStoredEmail credentials fallback failed:', error);
  }

  return null;
}

export async function saveStoredPinCode(pinCode) {
  if (pinCode == null || pinCode === '') {
    await Keychain.resetGenericPassword({ service: PIN_SERVICE });
    return;
  }

  const result = await Keychain.setGenericPassword('pin', String(pinCode), {
    service: PIN_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  if (!result) {
    throw new Error('Failed to save PIN to keychain');
  }
}

export async function getStoredPinCode() {
  const result = await Keychain.getGenericPassword({ service: PIN_SERVICE });
  return result?.password ?? null;
}

export async function hasStoredPinCode() {
  const storedPin = await getStoredPinCode();
  if (storedPin) {
    return true;
  }

  const credentials = await getStoredCredentials();
  return Boolean(credentials?.pinCode);
}

export async function saveUserCredentials({ email, password, pinCode }) {
  const payload = JSON.stringify({ password, pinCode });

  // Credentials stay readable after PIN auth. Face ID is gated separately so
  // either method alone can unlock — they are not both required.
  await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
  const result = await Keychain.setGenericPassword(
    email,
    payload,
    buildSetOptions(),
  );

  if (!result) {
    throw new Error('Failed to save credentials to keychain');
  }

  await saveStoredEmail(email);
  await saveBiometricGate();

  if (pinCode != null && pinCode !== '') {
    await saveStoredPinCode(pinCode);
  }
}

export async function getUserCredentialsWithBiometric() {
  const gateExists = await Keychain.hasGenericPassword({
    service: BIOMETRIC_GATE_SERVICE,
  });

  if (gateExists) {
    const unlocked = await unlockBiometricGate();
    if (!unlocked) {
      return null;
    }
    return getStoredCredentials();
  }

  // Legacy path: credentials item itself was stored with biometric access control.
  const credentials = await Keychain.getGenericPassword({
    service: KEYCHAIN_SERVICE,
    authenticationPrompt: AUTH_PROMPT,
  });

  if (!credentials) {
    return null;
  }

  return parseStoredCredentials(credentials);
}

export async function getStoredCredentials() {
  const credentials = await Keychain.getGenericPassword({
    service: KEYCHAIN_SERVICE,
  });

  if (!credentials) {
    return null;
  }

  return parseStoredCredentials(credentials);
}

function parseStoredCredentials(credentials) {
  const { username: email, password: payload } = credentials;

  try {
    const { password, pinCode } = JSON.parse(payload);
    return { email, password, pinCode };
  } catch {
    return null;
  }
}

export async function clearUserCredentials() {
  await Promise.all([
    Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE }),
    Keychain.resetGenericPassword({ service: PIN_SERVICE }),
    Keychain.resetGenericPassword({ service: BIOMETRIC_GATE_SERVICE }),
    Keychain.resetGenericPassword({ service: EMAIL_SERVICE }),
    AsyncStorage.removeItem(STORAGE_KEYS.USER_EMAIL),
  ]);
}
