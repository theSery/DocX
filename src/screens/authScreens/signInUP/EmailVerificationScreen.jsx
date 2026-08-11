import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { AuthScreenLayout } from '../../../components/layout';
import {
  useAuthScreenStyles,
  useOtpInput,
  useTheme,
  useThemedFocusStatusBar,
  useThemedStyles,
  useToast,
} from '../../../hooks';
import MainHeader from '../../../components/headers/MainHeader';
import { AnimatedView, Typography } from '../../../components';
import AuthButton from '../../../components/buttons/AuthButton';
import emailCheck from '../../../assets/images/emailCheck.webp';
import openMail from '../../../assets/images/openMail.webp';
import { useState } from 'react';
import { OtpInputRowCode } from './components/OtpInputRowCode';
import LottieAnimation from '../../../components/animation/LottieAnimation';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { authApi } from '../../../api';

function CompletedEmailVerification({ otpInputProps, styles }) {
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

function SuccessEmailVerification({ styles, colors, isResetPassword }) {
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
          {isResetPassword
            ? '🎉 Կոդը հաջողությամբ հաստատված է'
            : '🎉 Էլ-փոստը հաջողությամբ հաստատված է'}
        </Typography>
      </View>
    </>
  );
}

export function EmailVerificationScreen({ navigation, route }) {
  const styles = useAuthScreenStyles();
  const localStyles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  useThemedFocusStatusBar();
  const { email, password, purpose = 'register' } = route.params ?? {};
  const isResetPassword = purpose === 'reset_password';
  const { code: otpCode, inputProps: otpInputProps } = useOtpInput();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState('');

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp({
        email,
        code: otpCode,
        purpose,
      });
      console.log('Verify OTP response:', response.data);
      showToast({
        title: 'Հաստատումը հաջողությամբ կատարվեց',
        body: isResetPassword
          ? 'Կոդը հաջողությամբ հաստատված է'
          : 'Ձեր էլ-փոստը հաջողությամբ հաստատված է',
        type: 'success',
      });
      setVerifiedCode(otpCode);
      setIsSuccess(true);
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
    if (isResetPassword) {
      navigation.navigate('ResetPassword', {
        email,
        code: verifiedCode || otpCode,
      });
      return;
    }
    navigation.navigate('Registration', { email, password });
  };

  const successButtonTitle = isResetPassword
    ? 'Վերականգնել գաղտնաբառը'
    : 'Գրանցվել';

  return (
    <AuthScreenLayout style={[styles.screen]}>
      <MainHeader onPress={() => navigation.goBack()} />
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
              title={'Էլ-փոստի հաստատում'}
              subtitle={`Մուտքագրեք Ձեր (${email}) էլ-փոստին ուղարկված կոդը`}
            />
            {isSuccess ? (
              <SuccessEmailVerification
                styles={localStyles}
                colors={colors}
                isResetPassword={isResetPassword}
              />
            ) : (
              <CompletedEmailVerification
                otpInputProps={otpInputProps}
                styles={localStyles}
              />
            )}
          </View>

          <View style={localStyles.buttonContainer}>
            <AuthButton
              title={isSuccess ? successButtonTitle : 'Հաստատել էլ-փոստը'}
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
  });
