import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthScreenLayout } from '../../components/layout';
import {
  useAuthScreenStyles,
  useAuthSession,
  useThemedFocusStatusBar,
  useThemedStyles,
  useToast,
} from '../../hooks';
import MainHeader from '../../components/headers/MainHeader';
import { FONT_FAMILY } from '../../theme';
import { Passcode } from '../authScreens/signInUP/components/Passcode';
import { ContentTiltes } from '../../components/titleComponents/ContentTiltles';
import { authApi, persistAuthResponse } from '../../api';
import {
  getBiometryType,
  getStoredCredentials,
  getUserCredentialsWithBiometric,
  hasStoredCredentials,
  isBiometricSupported,
} from '../../utils/secureStorage';
import * as Keychain from 'react-native-keychain';

function isUserCancellation(error) {
  const message = error?.message?.toLowerCase() ?? '';
  return message.includes('cancel') || message.includes('user denied');
}

function getBiometricLabel(biometryType) {
  switch (biometryType) {
    case Keychain.BIOMETRY_TYPE.FACE_ID:
    case Keychain.BIOMETRY_TYPE.FACE:
      return 'Face ID';
    case Keychain.BIOMETRY_TYPE.TOUCH_ID:
    case Keychain.BIOMETRY_TYPE.FINGERPRINT:
      return 'Touch ID';
    default:
      return 'Face ID / Touch ID';
  }
}

export function FaceIdScreen({ navigation, route }) {
  const styles = useAuthScreenStyles();
  const localStyles = useThemedStyles(createStyles);
  const { showToast } = useToast();
  useThemedFocusStatusBar();
  const { completeReauth } = useAuthSession();
  const nextScreen = route.params?.nextScreen;
  const isUnlockOnly = Boolean(nextScreen);
  const [passcode, setPasscode] = useState([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [canUseBiometric, setCanUseBiometric] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Face ID / Touch ID');
  const isAuthenticatingRef = useRef(false);

  const completeAuthentication = useCallback(async () => {
    if (isUnlockOnly) {
      navigation.replace(nextScreen);
      return;
    }
    await completeReauth();
  }, [completeReauth, isUnlockOnly, navigation, nextScreen]);

  const loginWithCredentials = useCallback(
    async ({ email, password }) => {
      try {
        console.log('[FaceId] Logging in with keychain credentials for:', email);
        const response = await authApi.login({ email, password });
        await persistAuthResponse(response);
        console.log('[FaceId] Login successful');
        await completeAuthentication();
      } catch (error) {
        console.log('[FaceId] Login failed:', error?.message ?? error);
        showToast({
          title: 'Մուտքը ձախողվեց',
          body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
          type: 'error',
        });
      }
    },
    [completeAuthentication, showToast],
  );

  const finishVerifiedAuth = useCallback(
    async credentials => {
      if (isUnlockOnly) {
        console.log('[FaceId] Unlock-only auth success — opening:', nextScreen);
        await completeAuthentication();
        return;
      }

      await loginWithCredentials(credentials);
    },
    [completeAuthentication, isUnlockOnly, loginWithCredentials, nextScreen],
  );

  const performBiometricLogin = useCallback(async () => {
    if (isAuthenticatingRef.current) {
      console.log('[FaceId] Biometric auth already in progress, skipping');
      return;
    }

    isAuthenticatingRef.current = true;
    setIsAuthenticating(true);
    console.log('[FaceId] Biometric auth started');

    try {
      const credentials = await getUserCredentialsWithBiometric();

      if (!credentials) {
        console.log('[FaceId] Biometric failed — no credentials returned from keychain');
        return;
      }

      console.log('[FaceId] Biometric success — credentials retrieved for:', credentials.email);
      await finishVerifiedAuth(credentials);
      console.log('[FaceId] Biometric flow completed successfully');
    } catch (error) {
      console.log('[FaceId] Biometric failed:', error?.message ?? error);

      if (!isUserCancellation(error)) {
        showToast({
          title: 'Նույնականացումը ձախողվեց',
          body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
          type: 'error',
        });
      } else {
        console.log('[FaceId] Biometric cancelled by user');
      }
    } finally {
      isAuthenticatingRef.current = false;
      setIsAuthenticating(false);
    }
  }, [finishVerifiedAuth, showToast]);

  useEffect(() => {
    let isMounted = true;

    async function prepareBiometricAuth() {
      try {
        const [biometryAvailable, credentialsStored, biometryType] = await Promise.all([
          isBiometricSupported(),
          hasStoredCredentials(),
          getBiometryType(),
        ]);

        console.log('[FaceId] Prepare — biometryAvailable:', biometryAvailable);
        console.log('[FaceId] Prepare — credentialsStored:', credentialsStored);
        console.log('[FaceId] Prepare — biometryType:', biometryType);

        if (!isMounted) {
          return;
        }

        const shouldUseBiometric = biometryAvailable && credentialsStored;
        setCanUseBiometric(shouldUseBiometric);
        setBiometricLabel(getBiometricLabel(biometryType));
        console.log('[FaceId] Prepare — shouldUseBiometric:', shouldUseBiometric);

        if (shouldUseBiometric) {
          await performBiometricLogin();
        }
      } catch (error) {
        console.log('[FaceId] Prepare biometric auth error:', error);
      }
    }

    prepareBiometricAuth();

    return () => {
      isMounted = false;
    };
  }, [performBiometricLogin]);

  const handlePinComplete = async pinCode => {
    if (isAuthenticating) {
      return;
    }

    setIsAuthenticating(true);
    console.log('[FaceId] PIN verification started');

    try {
      const credentials = await getStoredCredentials();

      if (!credentials?.pinCode || credentials.pinCode !== pinCode) {
        console.log('[FaceId] PIN verification failed — PIN mismatch or not stored');
        setPasscode([]);
        showToast({
          title: 'PIN-ը սխալ է',
          body: 'Փորձեք կրկին։',
          type: 'error',
        });
        return;
      }

      console.log('[FaceId] PIN verification successful');
      await finishVerifiedAuth(credentials);
    } catch (error) {
      console.log('[FaceId] PIN verification failed:', error?.message ?? error);
      setPasscode([]);
      showToast({
        title: 'PIN-ը սխալ է',
        body: error?.message || 'Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <AuthScreenLayout style={[styles.screen]}>
      <MainHeader
        onPress={isUnlockOnly ? () => navigation.goBack() : undefined}
      />
      <View style={localStyles.content}>
        <View style={localStyles.formContainer}>
          <ContentTiltes
            title="Մուտքագրեք PIN"
            subtitle="Մուտք լինելու համար խնդրում ենք մուտքագրել PIN-ը"
          />
          <View style={localStyles.passcodeContainer}>
            <Passcode
              value={passcode}
              onChange={setPasscode}
              onComplete={handlePinComplete}
              onBiometric={canUseBiometric ? performBiometricLogin : undefined}
              hasBiometric={canUseBiometric}
            />
          </View>
        </View>

        {!isUnlockOnly && (
          <View style={localStyles.footer}>
            <Text style={localStyles.hintText}>
              {canUseBiometric ? `${biometricLabel} կամ PIN` : 'Մուտքագրեք PIN'}
            </Text>
            <Pressable
              onPress={() => navigation.navigate('PinVerification')}
              disabled={isAuthenticating}
            >
              <Text style={localStyles.privacyText}>
                Վերականգնել PIN-կոդը
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </AuthScreenLayout>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      marginBottom: 20,
    },
    formContainer: {
      width: '100%',
    },
    footer: {
      flex: 1,
      justifyContent: 'flex-end',
      width: '100%',
      alignItems: 'center',
    },
    hintText: {
      fontSize: 14,
      lineHeight: 26,
      fontFamily: FONT_FAMILY.regular,
      color: colors.icons,
      marginTop: 4,
      textAlign: 'center',
    },
    privacyText: {
      fontSize: 14,
      lineHeight: 26,
      fontFamily: FONT_FAMILY.regular,
      color: colors.icons,
      marginTop: 4,
      marginBottom: 20,
      textAlign: 'center',
      textDecorationLine: 'underline',
    },
    passcodeContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
