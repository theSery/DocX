import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthScreenLayout } from '../../../components/layout';
import {
  useAuthScreenStyles,
  useAuthSession,
  useThemedFocusStatusBar,
  useThemedStyles,
  useToast,
} from '../../../hooks';
import MainHeader from '../../../components/headers/MainHeader';
import { saveUserCredentials } from '../../../utils/secureStorage';
import { Passcode } from './components/Passcode';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { authApi, persistAuthResponse } from '../../../api';

const PIN_LENGTH = 4;

export function PinCodeScreen({ navigation, route }) {
  const { name, surname, patronymic, email, password } = route.params;
  const styles = useAuthScreenStyles();
  const localStyles = useThemedStyles(createStyles);
  const { showToast } = useToast();
  useThemedFocusStatusBar();
  const { login } = useAuthSession();
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

  const handleRegister = useCallback(
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
        const response = await authApi.registerPersonal({
          email,
          name,
          surname,
          patronymic,
          password,
          pinCode,
        });
        await persistAuthResponse(response);
        await saveUserCredentials({ email, password, pinCode });
        const payload = response?.data?.data ?? response?.data;
        showToastWhileLocked({
          title: 'Գրանցումը հաջողությամբ կատարվեց',
          body:
            response?.data?.message ??
            payload?.message ??
            'Օգտատերը հաջողությամբ գրանցվել է',
          type: 'success',
        });
        await login();
      } catch (error) {
        console.log('Register personal error:', error);
        setPasscode([]);
        setFirstPin('');
        setStep('create');
        showToastWhileLocked({
          title: 'Գրանցումը ձախողվեց',
          body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
          type: 'error',
        });
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [email, login, name, password, patronymic, showToastWhileLocked, surname],
  );

  const handlePasscodeComplete = useCallback(
    code => {
      if (
        isLoadingRef.current ||
        isInputLockedRef.current ||
        code.length !== PIN_LENGTH
      ) {
        return;
      }

      // Immediately block further PIN input after the last digit.
      lockInput();

      if (stepRef.current === 'create') {
        setFirstPin(code);
        setPasscode([]);
        setStep('confirm');
        showToastWhileLocked({
          title: 'Կրկնեք PIN կոդը',
          body: 'Խնդրում ենք կրկին մուտքագրել PIN կոդը։',
          type: 'success',
        });
        return;
      }

      if (code !== firstPinRef.current) {
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

      handleRegister(code);
    },
    [handleRegister, lockInput, showToastWhileLocked],
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
    step === 'confirm' ? 'Կրկնեք ձեր PIN կոդը' : 'Սահմանել PIN կոդը';

  return (
    <AuthScreenLayout style={[styles.screen]}>
      <MainHeader onPress={() => navigation.goBack()} isHome={true} />
      <View style={localStyles.content}>
        <View style={localStyles.formContainer}>
          <ContentTiltes
            title={title}
            subtitle={'Մուտք լինելու համար խնդրում ենք մուտքագրել PIN-ը'}
          />
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
