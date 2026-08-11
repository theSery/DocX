import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AnimatedView, Typography } from '../../../components';
import AuthButton from '../../../components/buttons/AuthButton';
import LottieAnimation from '../../../components/animation/LottieAnimation';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { authApi, persistAuthResponse } from '../../../api';
import {
  useGlobalStyles,
  useOtpInput,
  useTemporaryFocusStatusBar,
  useTheme,
  useThemedStyles,
  useToast,
} from '../../../hooks';
import {
  getStoredCredentials,
  getStoredEmail,
  saveStoredEmail,
  saveUserCredentials,
} from '../../../utils/secureStorage';
import { FONT_FAMILY, palette } from '../../../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';
import emailCheck from '../../../assets/images/emailCheck.webp';
import openMail from '../../../assets/images/openMail.webp';
import { OtpInputRowCode } from '../../authScreens/signInUP/components/OtpInputRowCode';
import { Passcode } from '../../authScreens/signInUP/components/Passcode';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN_LENGTH = 4;

function CompletedPinVerification({ otpInputProps, styles }) {
  return (
    <>
      <AnimatedView animation="fadeIn" style={styles.emailCheckContainer}>
        <Image
          source={emailCheck}
          style={styles.emailCheckIcon}
          resizeMode="cover"
        />
      </AnimatedView>
      <OtpInputRowCode {...otpInputProps} style={styles.otpInputRow} />
    </>
  );
}

function SuccessPinVerification({ styles, colors }) {
  return (
    <>
      <AnimatedView
        animation="fadeInDown"
        delay={200}
        style={styles.emailCheckContainer}
      >
        <Image
          source={openMail}
          style={styles.emailCheckIcon}
          resizeMode="cover"
        />
        <AnimatedView
          animation="fadeIn"
          delay={700}
          style={styles.lottieContainer}
        >
          <LottieAnimation
            source={require('../../../assets/lottie/Sucess.json')}
            autoPlay={true}
            loop={true}
            timing={2000}
            duration={2000}
            style={{ width: 80, height: 80 }}
          />
        </AnimatedView>
      </AnimatedView>
      <View>
        <Typography
          variant="h2"
          style={[
            styles.loginTitle,
            { color: colors.icons, textAlign: 'center', marginTop: 30 },
          ]}
        >
          🎉 Կոդը հաջողությամբ հաստատված է
        </Typography>
      </View>
    </>
  );
}

export function AccountResetPinScreen() {
  const navigation = useNavigation();
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();

  // Same theme-aware bar as Home; restore account-stack light icons on leave.
  useTemporaryFocusStatusBar();

  const [contentStep, setContentStep] = useState('verify');

  // --- Verify OTP state (PinVerificationScreen) ---
  const [email, setEmail] = useState('');
  const [emailResolved, setEmailResolved] = useState(false);
  const { code: otpCode, inputProps: otpInputProps, reset: resetOtpInput } =
    useOtpInput();
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState('');

  // --- Reset PIN state (ResetPinScreen) ---
  const [passcode, setPasscode] = useState([]);
  const [firstPin, setFirstPin] = useState('');
  const [pinStep, setPinStep] = useState('create');
  const [isResetting, setIsResetting] = useState(false);
  const [isInputLocked, setIsInputLocked] = useState(false);

  const isLoadingRef = useRef(false);
  const isInputLockedRef = useRef(false);
  const pinStepRef = useRef(pinStep);
  const firstPinRef = useRef(firstPin);

  pinStepRef.current = pinStep;
  firstPinRef.current = firstPin;

  useEffect(() => {
    let isMounted = true;

    async function loadEmail() {
      try {
        const storedEmail = await getStoredEmail();
        if (!isMounted) {
          return;
        }
        if (storedEmail) {
          setEmail(storedEmail);
        }
      } catch (error) {
        console.log('Load email error:', error);
      } finally {
        if (isMounted) {
          setEmailResolved(true);
        }
      }
    }

    loadEmail();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolveEmail = useCallback(async () => {
    const trimmed = email.trim();
    if (trimmed) {
      return trimmed;
    }
    return (await getStoredEmail()) || '';
  }, [email]);

  const handleSendOtp = useCallback(async () => {
    if (isSendingOtp) {
      return;
    }

    setIsSendingOtp(true);
    try {
      const userEmail = await resolveEmail();

      if (!userEmail || !EMAIL_PATTERN.test(userEmail)) {
        showToast({
          title: 'Վերականգնումը ձախողվեց',
          body: 'Մուտքագրեք վավեր էլ-փոստ։',
          type: 'error',
        });
        return;
      }

      setEmail(userEmail);
      await saveStoredEmail(userEmail);

      await authApi.sendOtp({
        email: userEmail,
        purpose: 'reset_pin',
      });

      setOtpSent(true);
      showToast({
        title: 'Մուտքագրեք Ձեր',
        body: `${userEmail} էլ-փոստին ուղարկված կոդը`,
        type: 'success',
      });
    } catch (error) {
      console.log('Send reset PIN OTP failed:', error?.message ?? error);
      showToast({
        title: 'Վերականգնումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      setIsSendingOtp(false);
    }
  }, [isSendingOtp, resolveEmail, showToast]);

  const handleSubmit = async () => {
    const userEmail = email.trim();

    if (!userEmail || !EMAIL_PATTERN.test(userEmail)) {
      showToast({
        title: 'Հաստատումը ձախողվեց',
        body: 'Մուտքագրեք վավեր էլ-փոստ։',
        type: 'error',
      });
      return;
    }

    if (otpCode.length !== 6) {
      showToast({
        title: 'Հաստատումը ձախողվեց',
        body: 'Մուտքագրեք 6 նիշանոց կոդը։',
        type: 'error',
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Validate OTP format only — do not call verifyOtp here.
      // reset-pin validates and consumes the OTP; verifyOtp would invalidate it first.
      await saveStoredEmail(userEmail);
      setVerifiedCode(otpCode);
      setIsSuccess(true);
      resetOtpInput();
      showToast({
        title: 'Հաստատումը հաջողությամբ կատարվեց',
        body: 'Կոդը հաջողությամբ հաստատված է',
        type: 'success',
      });
    } catch (error) {
      console.log('Verify OTP error:', error);
      showToast({
        title: 'Հաստատումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleShowResetPin = () => {
    setContentStep('reset');
  };

  const lockInput = useCallback(() => {
    isInputLockedRef.current = true;
    setIsInputLocked(true);
  }, []);

  const unlockInput = useCallback(() => {
    isInputLockedRef.current = false;
    setIsInputLocked(false);
  }, []);

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

      const userEmail = email.trim();
      if (!userEmail || !verifiedCode) {
        return;
      }

      isLoadingRef.current = true;
      setIsResetting(true);

      try {
        await authApi.resetPin({
          email: String(userEmail),
          code: String(verifiedCode),
          newPin: String(pinCode),
        });

        const credentials = await getStoredCredentials();
        const password = credentials?.password;

        if (password) {
          const response = await authApi.login({ email: userEmail, password });
          await persistAuthResponse(response);
          await saveUserCredentials({
            email: userEmail,
            password,
            pinCode,
          });
        }

        showToastWhileLocked({
          title: 'PIN-ը հաջողությամբ թարմացվեց',
          body: password
            ? 'Դուք հաջողությամբ մուտք եք գործել։'
            : 'Խնդրում ենք մուտք գործել նորից։',
          type: 'success',
        });

        navigation.navigate('AccountMain');
      } catch (error) {
        console.log('Reset PIN error:', error);
        setPasscode([]);
        setFirstPin('');
        setPinStep('create');
        showToastWhileLocked({
          title: 'PIN-ի թարմացումը ձախողվեց',
          body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
          type: 'error',
        });
      } finally {
        isLoadingRef.current = false;
        setIsResetting(false);
      }
    },
    [email, navigation, showToastWhileLocked, verifiedCode],
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

      lockInput();

      if (pinStepRef.current === 'create') {
        setFirstPin(codeValue);
        setPasscode([]);
        setPinStep('confirm');
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
        setPinStep('create');
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
        isResetting ||
        isInputLockedRef.current
      ) {
        return;
      }
      setPasscode(next);
    },
    [isResetting],
  );

  const needsEmailInput = emailResolved && !email.trim();
  const pinTitle =
    pinStep === 'confirm' ? 'Կրկնեք նոր PIN կոդը' : 'Սահմանել նոր PIN կոդը';
  const pinSubtitle =
    pinStep === 'confirm'
      ? 'Խնդրում ենք կրկին մուտքագրել նոր PIN կոդը'
      : 'Մուտք լինելու համար խնդրում ենք մուտքագրել նոր PIN-ը';

  if (contentStep === 'reset') {
    return (
      <View style={[globalStyles.screen, styles.screen]}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.contentContainer}
        >
          <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
            <ContentTiltes title={pinTitle} subtitle={pinSubtitle} />
            <View style={styles.passcodeContainer}>
              <Passcode
                hasBiometric={false}
                disabled={isInputLocked || isResetting}
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

  return (
    <View style={[globalStyles.screen, styles.screen]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.scrollContent}
      >
        <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
          <ContentTiltes
            title={'PIN կոդի վերականգնում'}
            subtitle={
              email.trim()
                ? `Մուտքագրեք Ձեր (${email.trim()}) էլ-փոստին ուղարկված կոդը`
                : 'Մուտքագրեք Ձեր էլ-փոստը և ուղարկված կոդը'
            }
          />
          {!isSuccess && needsEmailInput && (
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="example@docx.am"
              placeholderTextColor={colors.textDisabled}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.emailInput,
                {
                  color: colors.icons,
                  borderColor: colors.cardSelected,
                  backgroundColor: colors.surface,
                },
              ]}
            />
          )}
          {!isSuccess && (
            <Pressable
              onPress={handleSendOtp}
              disabled={isSendingOtp}
              style={styles.sendOtpButton}
            >
              {isSendingOtp ? (
                <ActivityIndicator
                  color={palette.mainBlue}
                  style={styles.resetPinLoader}
                />
              ) : (
                <Text style={styles.privacyText}>
                  {otpSent
                    ? 'Կրկին ուղարկել կոդը'
                    : 'Ուղարկել կոդը էլ. փոստին'}
                </Text>
              )}
            </Pressable>
          )}
          {isSuccess ? (
            <SuccessPinVerification styles={styles} colors={colors} />
          ) : (
            <CompletedPinVerification
              otpInputProps={otpInputProps}
              styles={styles}
            />
          )}
        </AnimatedView>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: TAB_BAR_BOTTOM_OFFSET + 20}]}>
        <AuthButton
          title={isSuccess ? 'Սահմանել նոր PIN' : 'Հաստատել կոդը'}
          onPress={() => (isSuccess ? handleShowResetPin() : handleSubmit())}
          isLoading={isVerifying}
        />
      </View>
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 16,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      width: '100%',
      paddingBottom: 20,
      
    },
    contentContainer: {
      width: '100%',
      flexGrow: 1,
    },
    content: {
      width: '100%',
      alignItems: 'center',
      paddingTop: 20,
   
    },
    passcodeContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
   
    },
    otpInputRow: {
      gap: 10,
      justifyContent: 'center',
    },
    footer: {
      paddingTop: 12,
      backgroundColor: colors.background,
    },
    emailCheckIcon: {
      width: 220,
      height: 248,
    },
    emailCheckContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    lottieContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      position: 'absolute',
      zIndex: 1000,
      height: '100%',
      top: 10,
    },
    loginTitle: {},
    sendOtpButton: {
      marginBottom: 20,
    },
    emailInput: {
      width: '100%',
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      fontFamily: FONT_FAMILY.regular,
      marginBottom: 16,
    },
    privacyText: {
      fontSize: 14,
      lineHeight: 26,
      fontFamily: FONT_FAMILY.regular,
      color: palette.mainBlue,
      textAlign: 'center',
      textDecorationLine: 'underline',
    },
    resetPinLoader: {
      marginTop: 0,
    },
  });
