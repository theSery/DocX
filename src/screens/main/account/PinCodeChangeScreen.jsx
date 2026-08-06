import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AnimatedView } from '../../../components';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { authApi } from '../../../api';
import { useGlobalStyles, useThemedStyles, useToast } from '../../../hooks';
import {
  getStoredPinCode,
  saveStoredPinCode,
} from '../../../utils/secureStorage';
import { Passcode } from '../../authScreens/signInUP/components/Passcode';

const PIN_LENGTH = 4;

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
  const isLoadingRef = useRef(false);

  const stepContent = STEP_CONTENT[step];

  const clearPasscode = useCallback(() => {
    setPasscode([]);
  }, []);

  const resetFlow = useCallback(() => {
    setStep('old');
    setOldPin('');
    setPasscode([]);
  }, []);

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
      } catch (error) {
        console.log(
          'PinCodeChangeScreen current PIN error',
          error?.response ?? error,
        );
        clearPasscode();
        showToast({
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
    [clearPasscode, showToast, validateCurrentPin],
  );

  const handleConfirmPinComplete = useCallback(
    pinCode => {
      if (isLoadingRef.current || pinCode.length !== PIN_LENGTH || !oldPin) {
        return;
      }

      if (pinCode !== oldPin) {
        clearPasscode();
        showToast({
          title: 'PIN կոդերը չեն համընկնում',
          body: 'Կրկնեք ներկայիս PIN կոդը։',
          type: 'error',
          position: 'bottom',
        });
        return;
      }

      setPasscode([]);
      setStep('new');
    },
    [clearPasscode, oldPin, showToast],
  );

  const handleNewPinComplete = useCallback(
    async pinCode => {
      if (isLoadingRef.current || pinCode.length !== PIN_LENGTH || !oldPin) {
        return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);

      try {
        await authApi.changePin({ oldPin, newPin: pinCode });
        await saveStoredPinCode(pinCode);

        showToast({
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
        showToast({
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
    [navigation, oldPin, resetFlow, showToast],
  );

  const handlePasscodeComplete = useCallback(
    pinCode => {
      if (step === 'old') {
        handleOldPinComplete(pinCode);
        return;
      }
      if (step === 'confirm') {
        handleConfirmPinComplete(pinCode);
        return;
      }
      handleNewPinComplete(pinCode);
    },
    [
      handleConfirmPinComplete,
      handleNewPinComplete,
      handleOldPinComplete,
      step,
    ],
  );

  const handlePasscodeChange = useCallback(
    next => {
      if (isLoadingRef.current || isLoading) {
        return;
      }
      setPasscode(next);
    },
    [isLoading],
  );

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
              hasBiometric={false}
              value={passcode}
              onChange={handlePasscodeChange}
              onComplete={handlePasscodeComplete}
            />
          </View>
        </AnimatedView>
      </ScrollView>
    </View>
  );
}
