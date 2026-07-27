import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AnimatedView } from '../../../components';
import AuthButton from '../../../components/buttons/AuthButton';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { authApi } from '../../../api';
import { useGlobalStyles, useThemedStyles, useToast } from '../../../hooks';

import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';
import { getStoredCredentials, saveUserCredentials } from '../../../utils/secureStorage';
import { Passcode } from '../../authScreens/signInUP/components/Passcode';

const PIN_LENGTH = 4;

const STEP_CONTENT = {
  old: {
    subtitle: 'Մուտքագրեք ներկայիս PIN կոդը',
    buttonTitle: 'Շարունակել',
  },
  new: {
    subtitle: 'Սահմանեք մուտքի համար նոր PIN կոդ',
    buttonTitle: 'Փոխել PIN կոդը',
  },
};

const createStyles = (colors) =>
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
    },
    content: {
      width: '100%',
      alignItems: 'center',
    },
    passcodeContainer: {
      width: '100%',
      alignItems: 'center',
    },
    footer: {
      paddingTop: 12,
      backgroundColor: colors.background,
    },
  });

export function PinCodeChangeScreen() {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { showToast } = useToast();
  const [step, setStep] = useState('old');
  const [oldPin, setOldPin] = useState('');
  const [passcode, setPasscode] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const isComplete = passcode.length === PIN_LENGTH;
  const stepContent = STEP_CONTENT[step];

  const resetForm = () => {
    setStep('old');
    setOldPin('');
    setPasscode([]);
  };

  const handleContinue = () => {
    if (!isComplete || isLoading) {
      return;
    }

    setOldPin(passcode.join(''));
    setPasscode([]);
    setStep('new');
  };

  const handleSubmit = async () => {
    if (!isComplete || isLoading) {
      return;
    }

    const newPin = passcode.join('');
    setIsLoading(true);

    try {
      await authApi.changePin({ oldPin, newPin });

      const credentials = await getStoredCredentials();
      if (credentials) {
        await saveUserCredentials({
          email: credentials.email,
          password: credentials.password,
          pinCode: newPin,
        });
      }

      resetForm();
      showToast({
        title: 'PIN կոդը հաջողությամբ փոխվեց',
        type: 'success',
        position: 'bottom',
      });
    } catch (error) {
      console.log('PinCodeChangeScreen error', error.response);
      resetForm();
      showToast({
        title: 'PIN կոդի փոփոխումը ձախողվեց',
        body: error?.message,
        type: 'error',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              onChange={setPasscode}
            />
          </View>
        </AnimatedView>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: TAB_BAR_BOTTOM_OFFSET }]}>
        <AuthButton
          title={stepContent.buttonTitle}
          onPress={step === 'old' ? handleContinue : handleSubmit}
          disabled={!isComplete}
          isLoading={isLoading}
        />
      </View>
    </View>
  );
}
