import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AuthScreenLayout } from '../../../components/layout';
import { useAuthScreenStyles, useToast } from '../../../hooks';
import MainHeader from '../../../components/headers/MainHeader';
import { AnimatedView, FormField, Typography } from '../../../components';
import { useForm } from 'react-hook-form';
import AuthButton from '../../../components/buttons/AuthButton';
import UserSvg from '../../../components/icons/UserSvg';
import { FONT_FAMILY, palette } from '../../../theme';
import emailCheck from '../../../assets/images/emailCheck.webp';

import openMail from '../../../assets/images/openMail.webp';
import { useState } from 'react';
import { OtpInputRowCode } from './components/OtpInputRowCode';
import LottieAnimation from '../../../components/animation/LottieAnimation';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { authApi } from '../../../api';



function CompletedEmailVerification({ digits, handleChangeDigit, focusedIndex, setFocusedIndex }) {
  return (
    <>
      <AnimatedView animation="fadeIn" style={registrationScreenStyles.emailCheckContainer}>
        <Image
          source={emailCheck}
          style={registrationScreenStyles.emailCheckIcon}
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

function SuccessEmailVerification() {
  return (
    <>
      <AnimatedView animation="fadeInDown" delay={200} style={registrationScreenStyles.emailCheckContainer}>

        <Image
          source={openMail}
          style={registrationScreenStyles.emailCheckIcon}
          resizeMode="cover"
        />
        <AnimatedView animation="fadeIn" delay={700} style={registrationScreenStyles.lottieContainer}>
          <LottieAnimation source={require('../../../assets/lottie/Sucess.json')} autoPlay={true} loop={true} timing={2000} duration={2000} style={{ width: 80, height: 80, }} />
        </AnimatedView>

      </AnimatedView>
      <View>
        <Typography
          variant="h2"
          style={[registrationScreenStyles.loginTitle, { color: palette.mainBlue, textAlign: 'center', marginTop: 30 }]}
        >
          🎉 Էլ-փոստը հաջողությամբ հաստատված է
        </Typography>
      </View>
    </>
  );
}
export function EmailVerificationScreen({ navigation, route }) {
  const styles = useAuthScreenStyles();
  const { showToast } = useToast();
  const { email, password } = route.params;
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const code = digits.join('');
      const response = await authApi.verifyOtp({
        email,
        code,
        purpose: 'register',
      });
      console.log('Verify OTP response:', response.data);
      showToast({
        title: 'Հաստատումը հաջողությամբ կատարվեց',
        body: 'Ձեր էլ-փոստը հաջողությամբ հաստատված է',
        type: 'success',
      });
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
    navigation.navigate('Registration', { email, password });
}


  const handleChangeDigit = (index, value) => {
    setDigits(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <AuthScreenLayout
      style={[styles.screen, { backgroundColor: palette.mainWhite }]}
    >
      <MainHeader onPress={() => navigation.goBack()} />
      <ScrollView
        style={registrationScreenStyles.formArea}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={registrationScreenStyles.scrollContent}
      >
        <View style={registrationScreenStyles.content}>
          <View style={registrationScreenStyles.formContainer}>
          <ContentTiltes
           title={'Էլ-փոստի հաստատում'} 
           subtitle={`Մուտքագրեք Ձեր (${email}) էլ-փոստին ուղարկված կոդը`} />
            {isSuccess ? <SuccessEmailVerification /> : <CompletedEmailVerification
              digits={digits}
              handleChangeDigit={handleChangeDigit}
              focusedIndex={focusedIndex}
              setFocusedIndex={setFocusedIndex} />}
          </View>

          <View style={registrationScreenStyles.buttonContainer}>
            <AuthButton
              title={isSuccess ? 'Ստեղծել PIN' : 'Հաստատել էլ-փոստը'}
              onPress={() => (isSuccess ? handleNavigate() : handleSubmit())}
              isLoading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </AuthScreenLayout>
  );
}
const registrationScreenStyles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  container: {
    flex: 1,
    height: '100%',
  },
  formContainer: {
    width: '100%',
  },
  privacyText: {
    fontSize: 10,
    lineHeight: 18,
    fontFamily: FONT_FAMILY.regular,
    color: palette.gray,
    marginTop: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  privacyTextBold: {
    fontFamily: FONT_FAMILY.regular,
    color: palette.mainBlue,
    textDecorationLine: 'underline',
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
  privacyTextContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  lottieContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    // backgroundColor: 'red',
    position: 'absolute',
    zIndex: 1000,
    height: '100%',
    top: 10,
  },
});
