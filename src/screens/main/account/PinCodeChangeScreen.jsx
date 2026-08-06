import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnimatedView } from '../../../components';
import AuthButton from '../../../components/buttons/AuthButton';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { authApi } from '../../../api';
import { useGlobalStyles, useThemedStyles, useToast } from '../../../hooks';
import { FONT_FAMILY } from '../../../theme';

import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';
import { getStoredCredentials, saveUserCredentials } from '../../../utils/secureStorage';
import { navigateToPinVerification } from '../../../navigation/navigationRef';
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
    recoveryFooter: {
      width: '100%',
      alignItems: 'center',
      marginTop: 12,
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
      textAlign: 'center',
      textDecorationLine: 'underline',
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
  const [showPinRecovery, setShowPinRecovery] = useState(false);

  const isComplete = passcode.length === PIN_LENGTH;
  const stepContent = STEP_CONTENT[step];

  const resetForm = () => {
    setStep('old');
    setOldPin('');
    setPasscode([]);
  };

  const handleIncorrectPin = () => {
    setPasscode([]);
    setShowPinRecovery(true);
    showToast({
      title: 'PIN-ը սխալ է',
      body: 'Փորձեք կրկին։',
      type: 'error',
      position: 'bottom',
    });
  };

  const handleContinue = async () => {
    if (!isComplete || isLoading) {
      return;
    }

    const enteredPin = passcode.join('');
    setIsLoading(true);

    try {
      const credentials = await getStoredCredentials();

      if (!credentials?.pinCode || credentials.pinCode !== enteredPin) {
        handleIncorrectPin();
        return;
      }

      setOldPin(enteredPin);
      setPasscode([]);
      setStep('new');
    } catch (error) {
      console.log('PinCodeChangeScreen continue error', error);
      handleIncorrectPin();
    } finally {
      setIsLoading(false);
    }
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
      setShowPinRecovery(false);
      showToast({
        title: 'PIN կոդը հաջողությամբ փոխվեց',
        type: 'success',
        position: 'bottom',
      });
    } catch (error) {
      console.log('PinCodeChangeScreen error', error.response);
      resetForm();
      setShowPinRecovery(true);
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
        {showPinRecovery && (
          <View style={styles.recoveryFooter}>
            <Text style={styles.hintText}>Մուտքագրեք PIN</Text>
            <Pressable
              onPress={navigateToPinVerification}
              disabled={isLoading}
            >
              <Text style={styles.privacyText}>Վերականգնել PIN-կոդը</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
