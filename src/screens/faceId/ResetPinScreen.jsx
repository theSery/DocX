import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthScreenLayout } from '../../components/layout';
import {
  useAuthScreenStyles,
  useAuthSession,
  useThemedFocusStatusBar,
  useThemedStyles,
  useToast,
} from '../../hooks';
import MainHeader from '../../components/headers/MainHeader';
import {
  getStoredCredentials,
  saveUserCredentials,
} from '../../utils/secureStorage';
import { Passcode } from '../authScreens/signInUP/components/Passcode';
import { ContentTiltes } from '../../components/titleComponents/ContentTiltles';
import { authApi, persistAuthResponse } from '../../api';

const PIN_LENGTH = 4;

export function ResetPinScreen({ navigation, route }) {
  const { email, code } = route.params;
  const styles = useAuthScreenStyles();
  const localStyles = useThemedStyles(createStyles);
  const { showToast } = useToast();
  useThemedFocusStatusBar();
  const { completeReauth } = useAuthSession();
  const [passcode, setPasscode] = useState([]);
  const [firstPin, setFirstPin] = useState('');
  const [step, setStep] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputLocked, setIsInputLocked] = useState(false);

  const isLoadingRef = useRef(false);
  const isInputLockedRef = useRef(false);
  const stepRef = useRef(step);
  const firstPinRef = useRef(firstPin);

  stepRef.current = step;
  firstPinRef.current = firstPin;

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

  const handleResetPin = useCallback(
    async pinCode => {
      if (
        !pinCode ||
        pinCode.length !== PIN_LENGTH ||
        isLoadingRef.current
      ) {
        return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);

      try {
        await authApi.resetPin({
          email: String(email),
          code: String(code),
          newPin: String(pinCode),
        });

        const credentials = await getStoredCredentials();
        const password = credentials?.password;

        if (!password) {
          showToastWhileLocked({
            title: 'PIN-ը թարմացվեց',
            body: 'Խնդրում ենք մուտք գործել նորից։',
            type: 'success',
          });
          return;
        }

        const response = await authApi.login({ email, password });
        await persistAuthResponse(response);
        await saveUserCredentials({
          email,
          password,
          pinCode,
        });

        showToastWhileLocked({
          title: 'PIN-ը հաջողությամբ թարմացվեց',
          body: 'Դուք հաջողությամբ մուտք եք գործել։',
          type: 'success',
        });

        await completeReauth();
      } catch (error) {
        console.log('Reset PIN error:', error);
        setPasscode([]);
        setFirstPin('');
        setStep('create');
        showToastWhileLocked({
          title: 'PIN-ի թարմացումը ձախողվեց',
          body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
          type: 'error',
        });
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [code, completeReauth, email, showToastWhileLocked],
  );

  const handlePasscodeComplete = useCallback(
    codeValue => {
      if (
        isLoadingRef.current ||
        isInputLockedRef.current ||
        codeValue.length !== PIN_LENGTH
      ) {
        return;
      }

      // Immediately block further PIN input after the last digit.
      lockInput();

      if (stepRef.current === 'create') {
        setFirstPin(codeValue);
        setPasscode([]);
        setStep('confirm');
        showToastWhileLocked({
          title: 'Կրկնեք PIN կոդը',
          body: 'Խնդրում ենք կրկին մուտքագրել նոր PIN կոդը։',
          type: 'success',
        });
        return;
      }

      if (codeValue !== firstPinRef.current) {
        setPasscode([]);
        setFirstPin('');
        setStep('create');
        showToastWhileLocked({
          title: 'PIN կոդերը չեն համընկնում',
          body: 'Փորձեք կրկին։',
          type: 'error',
        });
        return;
      }

      handleResetPin(codeValue);
    },
    [handleResetPin, lockInput, showToastWhileLocked],
  );

  const handlePasscodeChange = useCallback(
    next => {
      if (
        isLoadingRef.current ||
        isLoading ||
        isInputLockedRef.current
      ) {
        return;
      }
      setPasscode(next);
    },
    [isLoading],
  );

  const title =
    step === 'confirm' ? 'Կրկնեք նոր PIN կոդը' : 'Սահմանել նոր PIN կոդը';
  const subtitle =
    step === 'confirm'
      ? 'Խնդրում ենք կրկին մուտքագրել նոր PIN կոդը'
      : 'Մուտք լինելու համար խնդրում ենք մուտքագրել նոր PIN-ը';

  return (
    <AuthScreenLayout style={[styles.screen]}>
      <MainHeader onPress={() => navigation.goBack()} isHome={true} />
      <View style={localStyles.content}>
        <View style={localStyles.formContainer}>
          <ContentTiltes title={title} subtitle={subtitle} />
          <View style={localStyles.passcodeContainer}>
            <Passcode
              hasBiometric={false}
              disabled={isInputLocked || isLoading}
              value={passcode}
              onChange={handlePasscodeChange}
              onComplete={handlePasscodeComplete}
            />
          </View>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const createStyles = () =>
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
    passcodeContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
