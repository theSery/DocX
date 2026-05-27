import { useEffect, useState } from 'react';
import {  StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthScreenLayout } from '../../../components/layout';
import { useAuthScreenStyles } from '../../../hooks';
import MainHeader from '../../../components/headers/MainHeader';
import { useAuth } from '../../../contexts';
import { FONT_FAMILY, palette } from '../../../theme';
import { STORAGE_KEYS } from '../../../utils/storageKeys';
import { Passcode } from '../../authScreens/signInUP/components/Passcode';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import LottieAnimation from '../../../components/animation/LottieAnimation';

export function FaceIdScreen({ navigation }) {
  const styles = useAuthScreenStyles();
  const { setIsSign, setIsFaceID } = useAuth();
  const [passcode, setPasscode] = useState([]);
  const [hasExistingPin, setHasExistingPin] = useState(true);
  useEffect(() => {

    const timeout = setTimeout(async () => {
        setHasExistingPin(false);
      // your logic here
    //   await setIsSign(true);
      await setIsFaceID(true);
 
    }, 2000);
  
    return () => clearTimeout(timeout);
  
  }, [setIsSign, setIsFaceID]);
//   useEffect(() => {
//     let isMounted = true;
//     (async () => {
//       const storedPin = await AsyncStorage.getItem(STORAGE_KEYS.PIN_CODE);
//       if (isMounted) {
//         setHasExistingPin(Boolean(storedPin));
//       }
//     })();
//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   const handleComplete = async () => {
//     if (passcode.length > 0) {
//       await AsyncStorage.setItem(STORAGE_KEYS.PIN_CODE, passcode.join(''));
//     }
//     await setIsSign(true);
//   };

  const handleBiometric = () => {
    console.log('Handle biometrics');
  };

  return (
    <AuthScreenLayout
      style={[styles.screen, { backgroundColor: palette.mainWhite }]}
    >
      <MainHeader onPress={() => navigation.goBack()} />
      {hasExistingPin ?
        <View style={registrationScreenStyles.lottieContainer}>

          <LottieAnimation source={require('../../../assets/lottie/FaceID.json')} autoPlay loop style={{ width: 150, height: 150, }} />
        </View> : <></>
      }
      <View style={registrationScreenStyles.content}>

        <View style={registrationScreenStyles.formContainer}>
          <ContentTiltes
            title={ 'Մուտքագրեք PIN'}
            subtitle={'Մուտք լինելու համար խնդրում ենք մուտքագրել PIN-ը'} />
          <View style={registrationScreenStyles.passcodeContainer}>
            <Passcode
              value={passcode}
              onChange={setPasscode}
              onComplete={code => console.log('PIN entered:', code)}
              onBiometric={handleBiometric}
            />
          </View>

        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end', width: '100%' }}>
            <Text style={registrationScreenStyles.privacyText}> Մուտքագրեք PIN</Text>
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
