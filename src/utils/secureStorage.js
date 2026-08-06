import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'com.docx.userCredentials';
const PIN_SERVICE = 'com.docx.userPin';
const BIOMETRIC_GATE_SERVICE = 'com.docx.biometricGate';

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
  ]);
}
