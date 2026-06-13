
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthScreenLayout } from '../../../components/layout';
import { useAuthScreenStyles, useToast } from '../../../hooks';
import MainHeader from '../../../components/headers/MainHeader';
import { useAuthSession } from '../../../hooks';
import AuthButton from '../../../components/buttons/AuthButton';
import { FONT_FAMILY, palette } from '../../../theme';
import { saveUserCredentials } from '../../../utils/secureStorage';
import { Passcode } from './components/Passcode';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { authApi, persistAuthResponse } from '../../../api';
// import LottieAnimation from '../../../components/animation/LottieAnimation';

export function PinCodeScreen({ navigation, route }) {
  const { name, surname, patronymic, email, password } = route.params;
  const styles = useAuthScreenStyles();
  const { showToast } = useToast();
  const { login } = useAuthSession();
  const [passcode, setPasscode] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    const pinCode = passcode.join('');
    if (!pinCode) return;

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
      await login();
    } catch (error) {
      console.log('Register personal error:', error);
      showToast({
        title: 'Գրանցումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthScreenLayout
      style={[styles.screen, { backgroundColor: palette.mainWhite }]}
    >
      <MainHeader onPress={() => navigation.goBack()} />
      {/* {hasExistingPin ?
        <View style={registrationScreenStyles.lottieContainer}>

          <LottieAnimation source={require('../../../assets/lottie/FaceID.json')} autoPlay loop style={{ width: 150, height: 150, }} />
        </View> : <></>
      } */}
      <View style={registrationScreenStyles.content}>

        <View style={registrationScreenStyles.formContainer}>
          <ContentTiltes
            title={'Սահմանել PIN կոդը'}
            subtitle={'Մուտք լինելու համար խնդրում ենք մուտքագրել PIN-ը'} />
          <View style={registrationScreenStyles.passcodeContainer}>
            <Passcode
              hasBiometric={false}
              value={passcode}
              onChange={setPasscode}
              onComplete={code => console.log('PIN entered:', code)}
            />
          </View>

        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end', width: '100%' }}>

            <AuthButton
              title="Սահմանել PIN կոդը"
              onPress={handleComplete}
              isLoading={isLoading}
            />
        
        </View>
      </View>
    </AuthScreenLayout>
  );
}
const registrationScreenStyles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'red',
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
    fontSize: 14,
    lineHeight: 26,
    fontFamily: FONT_FAMILY.regular,
    color: palette.mainBlue,
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  privacyTextBold: {
    fontFamily: FONT_FAMILY.semiBold,
    color: palette.mainBlue,
    textDecorationLine: 'underline',
  },
  passcodeContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.mainWhite,
    zIndex: 1000,
    opacity: 0.7,
  },
});
