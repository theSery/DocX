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
  getStoredEmail,
  getStoredPinCode,
  getUserCredentialsWithBiometric,
  hasStoredCredentials,
  isBiometricSupported,
  saveStoredEmail,
} from '../../utils/secureStorage';
import * as Keychain from 'react-native-keychain';
import { useAppSelector } from '../../store';
import { selectIsEmailVerified } from '../../store/slices/personalDataSlice';

const PIN_LENGTH = 4;
const PIN_FILL_STEP_MS = 60;
const PIN_FILL_HOLD_MS = 180;

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
  const isEmailVerified = useAppSelector(selectIsEmailVerified);
  const nextScreen = route.params?.nextScreen;
  const isUnlockOnly = Boolean(nextScreen);
  const [passcode, setPasscode] = useState([]);
  const [isPinVerifying, setIsPinVerifying] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Face ID / Touch ID');

  // Face ID and PIN run in parallel. First successful method wins.
  const hasCompletedAuthRef = useRef(false);
  const isBiometricInProgressRef = useRef(false);
  const isPinVerifyingRef = useRef(false);
  const isFillingPasscodeRef = useRef(false);
  const fillTimeoutsRef = useRef([]);
  const fillResolversRef = useRef([]);
  const performBiometricLoginRef = useRef(null);

  const clearFillAnimation = useCallback(() => {
    fillTimeoutsRef.current.forEach(clearTimeout);
    fillTimeoutsRef.current = [];
    fillResolversRef.current.forEach(resolve => resolve());
    fillResolversRef.current = [];
    isFillingPasscodeRef.current = false;
  }, []);

  const sleep = useCallback(ms => {
    return new Promise(resolve => {
      fillResolversRef.current.push(resolve);
      const timeoutId = setTimeout(() => {
        fillResolversRef.current = fillResolversRef.current.filter(
          pending => pending !== resolve,
        );
        resolve();
      }, ms);
      fillTimeoutsRef.current.push(timeoutId);
    });
  }, []);

  const animatePasscodeFill = useCallback(
    async pin => {
      const digits = String(pin).split('').slice(0, PIN_LENGTH);
      if (digits.length === 0) {
        return;
      }

      clearFillAnimation();
      isFillingPasscodeRef.current = true;
      setPasscode([]);

      try {
        for (let index = 0; index < digits.length; index += 1) {
          if (hasCompletedAuthRef.current) {
            return;
          }
          await sleep(PIN_FILL_STEP_MS);
          if (hasCompletedAuthRef.current) {
            return;
          }
          setPasscode(digits.slice(0, index + 1));
        }

        await sleep(PIN_FILL_HOLD_MS);
      } finally {
        isFillingPasscodeRef.current = false;
      }
    },
    [clearFillAnimation, sleep],
  );

  const claimAuthSuccess = useCallback(() => {
    if (hasCompletedAuthRef.current) {
      return false;
    }
    hasCompletedAuthRef.current = true;
    clearFillAnimation();
    return true;
  }, [clearFillAnimation]);

  const completeAuthentication = useCallback(async () => {
    if (isUnlockOnly) {
      navigation.replace(nextScreen);
      return;
    }
    await completeReauth();
  }, [completeReauth, isUnlockOnly, navigation, nextScreen]);

  const loginWithCredentials = useCallback(
    async ({ email, phoneNumber, password }) => {
      try {
        const identifier = email || phoneNumber;
        console.log('[FaceId] Logging in with keychain credentials for:', identifier);
        const response =
          phoneNumber && !email
            ? await authApi.loginWithPhone({ phoneNumber, password })
            : await authApi.login({ email, password });
        await persistAuthResponse(response);
        console.log('[FaceId] Login successful');
        await completeAuthentication();
      } catch (error) {
        // Allow the other method (PIN / Face ID) to retry after login failure.
        hasCompletedAuthRef.current = false;
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
      if (!claimAuthSuccess()) {
        console.log('[FaceId] Auth already completed by another method, skipping');
        return;
      }

      if (isUnlockOnly) {
        console.log('[FaceId] Unlock-only auth success — opening:', nextScreen);
        await completeAuthentication();
        return;
      }

      await loginWithCredentials(credentials);
    },
    [
      claimAuthSuccess,
      completeAuthentication,
      isUnlockOnly,
      loginWithCredentials,
      nextScreen,
    ],
  );

  const performBiometricLogin = useCallback(async () => {
    if (hasCompletedAuthRef.current) {
      return;
    }

    if (isBiometricInProgressRef.current) {
      console.log('[FaceId] Biometric auth already in progress, skipping');
      return;
    }

    isBiometricInProgressRef.current = true;
    console.log('[FaceId] Biometric auth started');

    try {
      const credentials = await getUserCredentialsWithBiometric();

      if (hasCompletedAuthRef.current) {
        console.log('[FaceId] Auth already completed via PIN, ignoring biometric result');
        return;
      }

      if (!credentials) {
        console.log('[FaceId] Biometric failed — no credentials returned from keychain');
        return;
      }

      console.log(
        '[FaceId] Biometric success — credentials retrieved for:',
        credentials.email || credentials.phoneNumber,
      );
      if (credentials.email) {
        await saveStoredEmail(credentials.email);
      }

      const storedPin =
        (await getStoredPinCode()) ?? credentials?.pinCode ?? null;

      if (storedPin && !hasCompletedAuthRef.current) {
        console.log('[FaceId] Animating PIN fill after Face ID success');
        await animatePasscodeFill(storedPin);
      }

      if (hasCompletedAuthRef.current) {
        console.log('[FaceId] Auth already completed via PIN during fill animation');
        return;
      }

      await finishVerifiedAuth(credentials);
      console.log('[FaceId] Biometric flow completed successfully');
    } catch (error) {
      if (hasCompletedAuthRef.current) {
        console.log('[FaceId] Auth already completed via PIN, ignoring biometric error');
        return;
      }

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
      isBiometricInProgressRef.current = false;
    }
  }, [animatePasscodeFill, finishVerifiedAuth, showToast]);

  performBiometricLoginRef.current = performBiometricLogin;

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

        if (!isMounted || hasCompletedAuthRef.current) {
          return;
        }

        const shouldAutoStartBiometric = biometryAvailable && credentialsStored;
        setBiometricLabel(getBiometricLabel(biometryType));
        console.log('[FaceId] Prepare — shouldAutoStartBiometric:', shouldAutoStartBiometric);

        // Auto-start Face ID only when biometric permission/hardware is available.
        // FaceIdIcon visibility is independent of permission (handled in Passcode).
        if (shouldAutoStartBiometric) {
          await performBiometricLoginRef.current?.();
        }
      } catch (error) {
        console.log('[FaceId] Prepare biometric auth error:', error);
      }
    }

    prepareBiometricAuth();

    return () => {
      isMounted = false;
      clearFillAnimation();
    };
  }, [clearFillAnimation]);

  const showInvalidPin = useCallback(() => {
    setPasscode([]);
    showToast({
      title: 'PIN-ը սխալ է',
      body: 'Փորձեք կրկին։',
      type: 'error',
    });
  }, [showToast]);

  const handlePasscodeChange = useCallback(next => {
    // Keep keypad usable while Face ID runs; lock only during auto-fill animation.
    if (isFillingPasscodeRef.current || hasCompletedAuthRef.current) {
      return;
    }
    setPasscode(next);
  }, []);

  const handleResetPin = useCallback(async () => {
    if (!isEmailVerified) {
      showToast({
        title: 'Հաստատեք էլ.-փոստը',
        body: 'PIN կոդը վերականգնելու համար խնդրում ենք նախ հաստատել ձեր էլ.-փոստը։',
        type: 'error',
      });
      if (isUnlockOnly) {
        navigation.navigate('ProfileInfo');
      } else {
        navigation.getParent()?.navigate('Main', {
          screen: 'Account',
          params: { screen: 'ProfileInfo' },
        });
      }
      return;
    }

    const storedEmail = await getStoredEmail();
    navigation.navigate('PinVerification', {
      email: storedEmail || undefined,
    });
  }, [isEmailVerified, isUnlockOnly, navigation, showToast]);

  const handlePinComplete = async pinCode => {
    // Never block PIN on Face ID — only prevent duplicate PIN submits,
    // auto-fill animation, and skip if Face ID already claimed success.
    if (
      hasCompletedAuthRef.current ||
      isPinVerifyingRef.current ||
      isFillingPasscodeRef.current
    ) {
      return;
    }

    isPinVerifyingRef.current = true;
    setIsPinVerifying(true);
    console.log('[FaceId] PIN verification started');

    try {
      if (isUnlockOnly) {
        const storedPin = await getStoredPinCode();

        if (storedPin) {
          if (storedPin !== pinCode) {
            console.log('[FaceId] PIN verification failed — PIN mismatch');
            showInvalidPin();
            return;
          }
        } else {
          await authApi.verifyPin({ pinCode });
        }

        if (hasCompletedAuthRef.current) {
          console.log('[FaceId] Auth already completed via Face ID, ignoring PIN result');
          return;
        }

        console.log('[FaceId] PIN verification successful — navigating to', nextScreen);
        await finishVerifiedAuth(null);
        return;
      }

      const storedPin = await getStoredPinCode();
      const credentials = await getStoredCredentials();
      const expectedPin = storedPin ?? credentials?.pinCode;

      if (!expectedPin || expectedPin !== pinCode) {
        console.log('[FaceId] PIN verification failed — PIN mismatch or not stored');
        showInvalidPin();
        return;
      }

      if (
        !(credentials?.email || credentials?.phoneNumber) ||
        !credentials?.password
      ) {
        console.log('[FaceId] PIN verification failed — credentials missing');
        showInvalidPin();
        return;
      }

      if (credentials.email) {
        await saveStoredEmail(credentials.email);
      }

      if (hasCompletedAuthRef.current) {
        console.log('[FaceId] Auth already completed via Face ID, ignoring PIN result');
        return;
      }

      console.log('[FaceId] PIN verification successful');
      await finishVerifiedAuth(credentials);
    } catch (error) {
      if (hasCompletedAuthRef.current) {
        return;
      }

      console.log('[FaceId] PIN verification failed:', error?.message ?? error);
      setPasscode([]);
      showToast({
        title: 'PIN-ը սխալ է',
        body: error?.message || 'Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      isPinVerifyingRef.current = false;
      setIsPinVerifying(false);
    }
  };

  return (
    <AuthScreenLayout style={[styles.screen]}>
      <MainHeader
        onPress={isUnlockOnly ? () => navigation.goBack() : undefined}
        isHome={true}
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
              onChange={handlePasscodeChange}
              onComplete={handlePinComplete}
              onBiometric={performBiometricLogin}
              hasBiometric
            />
          </View>
        </View>

        {!isUnlockOnly && (
          <View style={localStyles.footer}>
            <Text style={localStyles.hintText}>
              {`${biometricLabel} կամ PIN`}
            </Text>
            <Pressable
              onPress={handleResetPin}
              disabled={isPinVerifying}
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
      justifyContent: 'flex-start',
      width: '100%',
      marginBottom: 20,
      marginTop: 20,
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
