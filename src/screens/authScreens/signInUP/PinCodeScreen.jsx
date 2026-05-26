// import { Pressable, Text, View } from 'react-native';
// import { AuthScreenLayout } from '../../components/layout';
// import { useAuth } from '../../contexts';
// import { useAuthScreenStyles } from '../../hooks';

// export function PinCodeScreen() {
//   const styles = useAuthScreenStyles();
//   const { setIsSign } = useAuth();

//   const handleComplete = async () => {
//     await setIsSign(true);
//   };

//   return (
//     <AuthScreenLayout style={styles.screen}>
//       <View style={styles.content}>
//         <Text style={styles.title}>PIN code</Text>
//         <Text style={styles.subtitle}>Set a PIN to secure your account.</Text>
//         <Pressable style={styles.primaryButton} onPress={handleComplete}>
//           <Text style={styles.primaryButtonText}>Finish</Text>
//         </Pressable>
//       </View>
//     </AuthScreenLayout>
//   );
// }
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthScreenLayout } from '../../../components/layout';
import { useAuthScreenStyles } from '../../../hooks';
import MainHeader from '../../../components/headers/MainHeader';
import { Typography } from '../../../components';
import { useAuth } from '../../../contexts';
import GradientButton from '../../../components/buttons/GradientButton';
import { FONT_FAMILY, palette } from '../../../theme';
import { Passcode } from './components/Passcode';

export function PinCodeScreen({ navigation }) {
  const styles = useAuthScreenStyles();
  const { setIsSign } = useAuth();
  const [passcode, setPasscode] = useState([]);

  const handleComplete = async () => {
    await setIsSign(true);
  };

  const handleBiometric = () => {
    console.log('Handle biometrics');
  };
  return (
    <AuthScreenLayout
      style={[styles.screen, { backgroundColor: palette.mainWhite }]}
    >
      <MainHeader onPress={() => navigation.goBack()} />
      <View style={registrationScreenStyles.content}>
        <View style={registrationScreenStyles.formContainer}>
          <Typography variant="h2" style={registrationScreenStyles.loginTitle}>
            Սահմանել PIN կոդը
          </Typography>
          <Typography variant="h6" style={registrationScreenStyles.subTitle}>
            Կրկնեք PIN-ը
          </Typography>
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
          <Text style={registrationScreenStyles.privacyText}></Text>
          <Pressable
            onPress={handleComplete}
            // disabled={isSubmitting}
            style={({ pressed }) => [
              registrationScreenStyles.primaryButton,
              pressed && registrationScreenStyles.buttonPressed,
            ]}
          >
            <GradientButton height={45} isLight={false}>
              <Typography
                variant="h5"
                style={registrationScreenStyles.primaryButtonText}
              >
                Սահմանել PIN կոդը
              </Typography>
            </GradientButton>
          </Pressable>
        </View>
      </View>
      {/* <View style={styles.content}>
        <Text style={styles.title}>Registration</Text>
        <Text style={styles.subtitle}>Create your DocX account.</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Verification')}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </View> */}
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
  loginTitle: {
    letterSpacing: 2,
    marginTop: 20,
  },
  subTitle: {
    color: palette.gray,
    marginBottom: 30,
    letterSpacing: 0.4,
  },
  formContainer: {
    width: '100%',
  },
  privacyText: {
    fontSize: 10,
    lineHeight: 18,
    fontFamily: FONT_FAMILY.regular,
    color: palette.gray,
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
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
});
