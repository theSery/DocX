
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthScreenLayout } from '../../../components/layout';
import { useAuthScreenStyles, useToast } from '../../../hooks';
import MainHeader from '../../../components/headers/MainHeader';
import { Typography } from '../../../components';
import { useAuth } from '../../../contexts';
import GradientButton from '../../../components/buttons/GradientButton';
import { FONT_FAMILY, palette } from '../../../theme';
import { STORAGE_KEYS } from '../../../utils/storageKeys';
import { Passcode } from './components/Passcode';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { authApi } from '../../../api';
// import LottieAnimation from '../../../components/animation/LottieAnimation';

export function PinCodeScreen({ navigation, route }) {
  const { name, surname, patronymic, email, password } = route.params;
  const styles = useAuthScreenStyles();
  const { showToast } = useToast();
  const { setIsSign } = useAuth();
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
      console.log('Register personal response:', response.data);
      await AsyncStorage.setItem(STORAGE_KEYS.PIN_CODE, pinCode);
      await setIsSign(true);
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

            <Pressable
              onPress={handleComplete}
              disabled={isLoading}
              style={({ pressed }) => [
                registrationScreenStyles.primaryButton,
                isLoading && registrationScreenStyles.primaryButtonDisabled,
                pressed && !isLoading && registrationScreenStyles.buttonPressed,
              ]}
            >
              <GradientButton height={45} isLight={false}>
                {isLoading ? (
                  <ActivityIndicator color={palette.white} />
                ) : (
                  <Typography
                    variant="h5"
                    style={registrationScreenStyles.primaryButtonText}
                  >
                    Սահմանել PIN կոդը
                  </Typography>
                )}
              </GradientButton>
            </Pressable>
        
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
  primaryButton: {
    height: 45,
    overflow: 'hidden',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  primaryButtonText: {
    fontFamily: FONT_FAMILY.regular,
    color: palette.white,
    letterSpacing: 1.2,
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
