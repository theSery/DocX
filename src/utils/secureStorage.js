import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'com.docx.userCredentials';

const AUTH_PROMPT = {
  title: 'Նույնականացում',
  subtitle: 'Մուտք գործելու համար օգտագործեք Face ID կամ Touch ID',
  description: 'Մուտք գործելու համար օգտագործեք Face ID կամ Touch ID',
  cancel: 'Չեղարկել',
};

function buildSetOptions() {
  return {
    service: KEYCHAIN_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
  };
}

function buildBiometricSetOptions() {
  const options = {
    service: KEYCHAIN_SERVICE,
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    authenticationPrompt: AUTH_PROMPT,
  };

  if (Platform.OS === 'android') {
    options.storage = Keychain.STORAGE_TYPE.AES_GCM;
  }

  return options;
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

export async function saveUserCredentials({ email, password, pinCode }) {
  const payload = JSON.stringify({ password, pinCode });
  const biometrySupported = await isBiometricSupported();
  const options = biometrySupported
    ? buildBiometricSetOptions()
    : buildSetOptions();

  if (biometrySupported) {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
  }

  const result = await Keychain.setGenericPassword(email, payload, options);

  if (!result) {
    throw new Error('Failed to save credentials to keychain');
  }
}

export async function getUserCredentialsWithBiometric() {
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
  await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
}
