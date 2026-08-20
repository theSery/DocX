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
import { AuthScreenLayout } from '../../components/layout';
import {
  useAuthScreenStyles,
  useOtpInput,
  useTheme,
  useThemedFocusStatusBar,
  useThemedStyles,
  useToast,
} from '../../hooks';
import MainHeader from '../../components/headers/MainHeader';
import { AnimatedView, Typography } from '../../components';
import AuthButton from '../../components/buttons/AuthButton';
import emailCheck from '../../assets/images/emailCheck.webp';
import openMail from '../../assets/images/openMail.webp';
import { useCallback, useEffect, useState } from 'react';
import { OtpInputRowCode } from '../authScreens/signInUP/components/OtpInputRowCode';
import LottieAnimation from '../../components/animation/LottieAnimation';
import { ContentTiltes } from '../../components/titleComponents/ContentTiltles';
import { getStoredEmail, saveStoredEmail } from '../../utils/secureStorage';
import { authApi } from '../../api';
import { FONT_FAMILY, palette } from '../../theme';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      <OtpInputRowCode {...otpInputProps} />
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
            source={require('../../assets/lottie/Sucess.json')}
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

export function PinVerificationScreen({ navigation, route }) {
  const styles = useAuthScreenStyles();
  const localStyles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  useThemedFocusStatusBar();
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [emailResolved, setEmailResolved] = useState(
    Boolean(route.params?.email),
  );
  const { code: otpCode, inputProps: otpInputProps } = useOtpInput();
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadEmail() {
      if (route.params?.email) {
        setEmailResolved(true);
        return;
      }

      try {
        // Never call getStoredCredentials / biometric APIs here.
        const storedEmail = await getStoredEmail();
        if (!isMounted) {
          return;
        }
        if (storedEmail) {
          setEmail(storedEmail);
        }
        setEmailResolved(true);
      } catch (error) {
        console.log('Load email error:', error);
        if (isMounted) {
          setEmailResolved(true);
        }
      }
    }

    loadEmail();

    return () => {
      isMounted = false;
    };
  }, [route.params?.email]);

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

    setIsLoading(true);
    try {
      // Validate OTP format only — do not call verifyOtp here.
      // reset-pin validates and consumes the OTP; verifyOtp would invalidate it first.
      await saveStoredEmail(userEmail);
      setVerifiedCode(otpCode);
      setIsSuccess(true);
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
      setIsLoading(false);
    }
  };

  const handleNavigate = () => {
    navigation.navigate('ResetPin', {
      email: email.trim(),
      code: verifiedCode,
    });
  };

  const needsEmailInput = emailResolved && !email.trim();

  return (
    <AuthScreenLayout style={[styles.screen]}>
      <MainHeader onPress={() => navigation.goBack()} isHome={true} />
      <ScrollView
        style={localStyles.formArea}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={localStyles.scrollContent}
      >
        <View style={localStyles.content}>
          <View style={localStyles.formContainer}>
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
                  localStyles.emailInput,
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
                style={localStyles.sendOtpButton}
              >
                {isSendingOtp ? (
                  <ActivityIndicator
                    color={palette.mainBlue}
                    style={localStyles.resetPinLoader}
                  />
                ) : (
                  <Text style={localStyles.privacyText}>
                    {otpSent
                      ? 'Կրկին ուղարկել կոդը'
                      : 'Ուղարկել կոդը էլ. փոստին'}
                  </Text>
                )}
              </Pressable>
            )}
            {isSuccess ? (
              <SuccessPinVerification styles={localStyles} colors={colors} />
            ) : (
              <CompletedPinVerification
                otpInputProps={otpInputProps}
                styles={localStyles}
              />
            )}
          </View>

          <View style={localStyles.buttonContainer}>
            <AuthButton
              title={isSuccess ? 'Սահմանել նոր PIN' : 'Հաստատել կոդը'}
              onPress={() => (isSuccess ? handleNavigate() : handleSubmit())}
              isLoading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </AuthScreenLayout>
  );
}

const createStyles = () =>
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
    buttonContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      width: '100%',
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
    formArea: {
      flex: 1,
      width: '100%',
    },
    scrollContent: {
      flex: 1,
      width: '100%',
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
