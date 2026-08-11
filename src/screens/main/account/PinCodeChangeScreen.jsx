import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AnimatedView } from '../../../components';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { authApi } from '../../../api';
import { useGlobalStyles, useThemedStyles, useToast } from '../../../hooks';
import {
  getStoredPinCode,
  getUserCredentialsWithBiometric,
  saveStoredPinCode,
} from '../../../utils/secureStorage';
import { Passcode } from '../../authScreens/signInUP/components/Passcode';

const PIN_LENGTH = 4;
const PIN_FILL_STEP_MS = 90;
const PIN_FILL_HOLD_MS = 220;

const STEP_CONTENT = {
  old: {
    subtitle: 'Մուտքագրեք ներկայիս PIN կոդը',
  },
  confirm: {
    subtitle: 'Կրկնեք ներկայիս PIN կոդը',
  },
  new: {
    subtitle: 'Փոխարինեք ներկայիս PIN կոդը',
  },
};

function isUserCancellation(error) {
  const message = error?.message?.toLowerCase() ?? '';
  return message.includes('cancel') || message.includes('user denied');
}

const createStyles = () =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 16,
    },
    scroll: {
      flex: 1,
    },
    contentContainer: {
      width: '100%',
      flexGrow: 1,
    },
    content: {
      width: '100%',
      alignItems: 'center',
    },
    passcodeContainer: {
      width: '100%',
      alignItems: 'center',
    },
  });

export function PinCodeChangeScreen() {
  const navigation = useNavigation();
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { showToast } = useToast();
  const [step, setStep] = useState('old');
  const [oldPin, setOldPin] = useState('');
  const [passcode, setPasscode] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInputLocked, setIsInputLocked] = useState(false);

  const isLoadingRef = useRef(false);
  const isInputLockedRef = useRef(false);
  const isBiometricInProgressRef = useRef(false);
  const isFillingPasscodeRef = useRef(false);
  const fillTimeoutsRef = useRef([]);
  const fillResolversRef = useRef([]);
  const stepRef = useRef(step);
  const oldPinRef = useRef(oldPin);

  stepRef.current = step;
  oldPinRef.current = oldPin;

  const stepContent = STEP_CONTENT[step];
  // Face ID icon is shown on old/confirm steps regardless of permission status.
  // Permission is checked only when the icon is pressed (inside Passcode).
  const showBiometric = step === 'old' || step === 'confirm';

  const lockInput = useCallback(() => {
    isInputLockedRef.current = true;
    setIsInputLocked(true);
  }, []);

  const unlockInput = useCallback(() => {
    isInputLockedRef.current = false;
    setIsInputLocked(false);
  }, []);

  /** Show a toast and keep PIN input locked until the toast finishes. */
  const showToastWhileLocked = useCallback(
    toastConfig => {
      lockInput();
      showToast({
        ...toastConfig,
        visibilityTime: 2000,
        onHide: unlockInput,
      });
    },
    [lockInput, showToast, unlockInput],
  );

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
          await sleep(PIN_FILL_STEP_MS);
          setPasscode(digits.slice(0, index + 1));
        }
        await sleep(PIN_FILL_HOLD_MS);
      } finally {
        isFillingPasscodeRef.current = false;
      }
    },
    [clearFillAnimation, sleep],
  );

  useEffect(() => {
    return () => {
      clearFillAnimation();
    };
  }, [clearFillAnimation]);

  const clearPasscode = useCallback(() => {
    setPasscode([]);
  }, []);

  const resetFlow = useCallback(() => {
    clearFillAnimation();
    setStep('old');
    setOldPin('');
    setPasscode([]);
  }, [clearFillAnimation]);

  /** Verify current PIN against the stored value once (first step only). */
  const validateCurrentPin = useCallback(async pinCode => {
    const storedPin = await getStoredPinCode();

    if (storedPin) {
      if (storedPin !== pinCode) {
        throw new Error('PIN-ը սխալ է');
      }
      return;
    }

    await authApi.verifyPin({ pinCode });
  }, []);

  const handleOldPinComplete = useCallback(
    async pinCode => {
      if (isLoadingRef.current || pinCode.length !== PIN_LENGTH) {
        return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);

      try {
        await validateCurrentPin(pinCode);
        setOldPin(pinCode);
        setPasscode([]);
        setStep('confirm');
        showToastWhileLocked({
          title: 'Կրկնեք PIN կոդը',
          body: 'Խնդրում ենք կրկին մուտքագրել ներկայիս PIN կոդը։',
          type: 'success',
          position: 'bottom',
        });
      } catch (error) {
        console.log(
          'PinCodeChangeScreen current PIN error',
          error?.response ?? error,
        );
        clearPasscode();
        showToastWhileLocked({
          title: 'PIN-ը սխալ է',
          body: error?.message || 'Փորձեք կրկին։',
          type: 'error',
          position: 'bottom',
        });
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [clearPasscode, showToastWhileLocked, validateCurrentPin],
  );

  const handleConfirmPinComplete = useCallback(
    pinCode => {
      if (isLoadingRef.current || pinCode.length !== PIN_LENGTH || !oldPinRef.current) {
        return;
      }

      if (pinCode !== oldPinRef.current) {
        clearPasscode();
        showToastWhileLocked({
          title: 'PIN կոդերը չեն համընկնում',
          body: 'Կրկնեք ներկայիս PIN կոդը։',
          type: 'error',
          position: 'bottom',
        });
        return;
      }

      setPasscode([]);
      setStep('new');
      showToastWhileLocked({
        title: 'Մուտքագրեք նոր PIN կոդը',
        body: 'Խնդրում ենք մուտքագրել նոր PIN կոդը։',
        type: 'success',
        position: 'bottom',
      });
    },
    [clearPasscode, showToastWhileLocked],
  );

  const handleNewPinComplete = useCallback(
    async pinCode => {
      if (isLoadingRef.current || pinCode.length !== PIN_LENGTH || !oldPinRef.current) {
        return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);

      try {
        await authApi.changePin({
          oldPin: oldPinRef.current,
          newPin: pinCode,
        });
        await saveStoredPinCode(pinCode);

        showToastWhileLocked({
          title: 'PIN կոդը հաջողությամբ փոխվեց',
          type: 'success',
          position: 'bottom',
        });

        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          resetFlow();
        }
      } catch (error) {
        console.log(
          'PinCodeChangeScreen change PIN error',
          error?.response ?? error,
        );
        resetFlow();
        showToastWhileLocked({
          title: 'PIN կոդի փոփոխումը ձախողվեց',
          body: error?.message,
          type: 'error',
          position: 'bottom',
        });
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [navigation, resetFlow, showToastWhileLocked],
  );

  const handlePasscodeComplete = useCallback(
    pinCode => {
      if (isFillingPasscodeRef.current || isInputLockedRef.current) {
        return;
      }

      // Immediately block further PIN input after the last digit.
      lockInput();

      const currentStep = stepRef.current;
      if (currentStep === 'old') {
        handleOldPinComplete(pinCode);
        return;
      }
      if (currentStep === 'confirm') {
        handleConfirmPinComplete(pinCode);
        return;
      }
      handleNewPinComplete(pinCode);
    },
    [
      handleConfirmPinComplete,
      handleNewPinComplete,
      handleOldPinComplete,
      lockInput,
    ],
  );

  const handlePasscodeChange = useCallback(
    next => {
      if (
        isLoadingRef.current ||
        isLoading ||
        isInputLockedRef.current ||
        isFillingPasscodeRef.current ||
        isBiometricInProgressRef.current
      ) {
        return;
      }
      setPasscode(next);
    },
    [isLoading],
  );

  const handleBiometricPress = useCallback(async () => {
    const currentStep = stepRef.current;
    if (currentStep !== 'old' && currentStep !== 'confirm') {
      return;
    }

    if (
      isLoadingRef.current ||
      isInputLockedRef.current ||
      isBiometricInProgressRef.current ||
      isFillingPasscodeRef.current
    ) {
      return;
    }

    isBiometricInProgressRef.current = true;
    setIsLoading(true);

    try {
      const credentials = await getUserCredentialsWithBiometric();
      if (!credentials) {
        return;
      }

      const storedPin =
        (await getStoredPinCode()) ?? credentials?.pinCode ?? null;

      if (!storedPin || storedPin.length !== PIN_LENGTH) {
        showToastWhileLocked({
          title: 'PIN կոդը չի գտնվել',
          body: 'Խնդրում ենք մուտքագրել PIN կոդը ձեռքով։',
          type: 'error',
          position: 'bottom',
        });
        return;
      }

      await animatePasscodeFill(storedPin);

      if (currentStep === 'old') {
        await handleOldPinComplete(storedPin);
      } else {
        handleConfirmPinComplete(storedPin);
      }
    } catch (error) {
      console.log('PinCodeChangeScreen biometric error', error);
      if (!isUserCancellation(error)) {
        clearPasscode();
        showToastWhileLocked({
          title: 'Նույնականացումը ձախողվեց',
          body: error?.message || 'Փորձեք կրկին։',
          type: 'error',
          position: 'bottom',
        });
      } else {
        clearPasscode();
        unlockInput();
      }
    } finally {
      isBiometricInProgressRef.current = false;
      setIsLoading(false);
    }
  }, [
    animatePasscodeFill,
    clearPasscode,
    handleConfirmPinComplete,
    handleOldPinComplete,
    showToastWhileLocked,
    unlockInput,
  ]);

  return (
    <View style={[globalStyles.screen, styles.screen]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.contentContainer}
      >
        <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
          <ContentTiltes
            title="PIN կոդի փոփոխություն"
            subtitle={stepContent.subtitle}
          />
          <View style={styles.passcodeContainer}>
            <Passcode
              hasBiometric={showBiometric}
              disabled={isInputLocked || isLoading}
              value={passcode}
              onChange={handlePasscodeChange}
              onComplete={handlePasscodeComplete}
              onBiometric={showBiometric ? handleBiometricPress : undefined}
            />
          </View>
        </AnimatedView>
      </ScrollView>
    </View>
  );
}
