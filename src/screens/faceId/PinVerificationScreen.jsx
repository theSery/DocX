import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { AuthScreenLayout } from '../../components/layout';
import {
  useAuthScreenStyles,
  useThemedFocusStatusBar,
  useThemedStyles,
  useToast,
} from '../../hooks';
import MainHeader from '../../components/headers/MainHeader';
import { AnimatedView } from '../../components';
import AuthButton from '../../components/buttons/AuthButton';
import emailCheck from '../../assets/images/emailCheck.webp';
import { useEffect, useState } from 'react';
import { OtpInputRowCode } from '../authScreens/signInUP/components/OtpInputRowCode';
import { ContentTiltes } from '../../components/titleComponents/ContentTiltles';
import { getStoredCredentials } from '../../utils/secureStorage';

export function PinVerificationScreen({ navigation }) {
  const styles = useAuthScreenStyles();
  const localStyles = useThemedStyles(createStyles);
  const { showToast } = useToast();
  useThemedFocusStatusBar();
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);

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

  const handleSubmit = () => {
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

    // Do not call verifyOtp here — reset-pin validates the OTP.
    // Calling verifyOtp first consumes the code and causes "Invalid or expired OTP".
    navigation.navigate('ResetPin', {
      email,
      code,
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
            <AnimatedView animation="fadeIn" style={localStyles.emailCheckContainer}>
              <Image
                source={emailCheck}
                style={localStyles.emailCheckIcon}
                resizeMode="cover"
              />
            </AnimatedView>
            <OtpInputRowCode
              digits={digits}
              onChangeDigit={handleChangeDigit}
              focusedIndex={focusedIndex}
              onFocusIndex={setFocusedIndex}
            />
          </View>

          <View style={localStyles.buttonContainer}>
            <AuthButton title="Շարունակել" onPress={handleSubmit} />
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
  });
