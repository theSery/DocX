import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AuthScreenLayout } from '../../components/layout';
import {
  useAuthScreenStyles,
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
import { getStoredCredentials } from '../../utils/secureStorage';
import { authApi } from '../../api';
import { FONT_FAMILY, palette } from '../../theme';

function CompletedPinVerification({
  digits,
  handleChangeDigit,
  focusedIndex,
  setFocusedIndex,
  styles,
}) {
  return (
    <>
      <AnimatedView animation="fadeIn" style={styles.emailCheckContainer}>
        <Image
          source={emailCheck}
          style={styles.emailCheckIcon}
          resizeMode="cover"
        />
      </AnimatedView>
      <OtpInputRowCode
        digits={digits}
        onChangeDigit={handleChangeDigit}
        focusedIndex={focusedIndex}
        onFocusIndex={setFocusedIndex}
      />
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

export function PinVerificationScreen({ navigation }) {
  const styles = useAuthScreenStyles();
  const localStyles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  useThemedFocusStatusBar();
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadEmail() {
      try {
        const credentials = await getStoredCredentials();
        if (isMounted && credentials?.email) {
          setEmail(credentials.email);
        }
      } catch (error) {
        console.log('Load email error:', error);
      }
    }

    loadEmail();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSendOtp = useCallback(async () => {
    if (isSendingOtp) {
      return;
    }

    setIsSendingOtp(true);
    try {
      const credentials = await getStoredCredentials();
      const userEmail = credentials?.email || email;

      if (!userEmail) {
        showToast({
          title: 'Վերականգնումը ձախողվեց',
          body: 'Էլ-փոստը չի գտնվել։',
          type: 'error',
        });
        return;
      }

      if (!email) {
        setEmail(userEmail);
      }

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
  }, [email, isSendingOtp, showToast]);

  const handleSubmit = async () => {
    if (!email) {
      showToast({
        title: 'Հաստատումը ձախողվեց',
        body: 'Էլ-փոստը չի գտնվել։',
        type: 'error',
      });
      return;
    }

    const code = digits.join('');
    if (code.length !== 6) {
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
      setVerifiedCode(code);
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
      email,
      code: verifiedCode,
    });
  };

  const handleChangeDigit = (index, value) => {
    setDigits(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

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
                email
                  ? `Մուտքագրեք Ձեր (${email}) էլ-փոստին ուղարկված կոդը`
                  : 'Մուտքագրեք էլ-փոստին ուղարկված կոդը'
              }
            />
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
                digits={digits}
                handleChangeDigit={handleChangeDigit}
                focusedIndex={focusedIndex}
                setFocusedIndex={setFocusedIndex}
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
