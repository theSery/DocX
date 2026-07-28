import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthScreenLayout } from '../../../components/layout';
import {
  useAuthScreenStyles,
  useAuthSession,
  useThemedFocusStatusBar,
  useThemedStyles,
  useToast,
} from '../../../hooks';
import MainHeader from '../../../components/headers/MainHeader';
import { saveUserCredentials } from '../../../utils/secureStorage';
import { Passcode } from './components/Passcode';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { authApi, persistAuthResponse } from '../../../api';

const PIN_LENGTH = 4;

export function PinCodeScreen({ navigation, route }) {
  const { name, surname, patronymic, email, password } = route.params;
  const styles = useAuthScreenStyles();
  const localStyles = useThemedStyles(createStyles);
  const { showToast } = useToast();
  useThemedFocusStatusBar();
  const { login } = useAuthSession();
  const [passcode, setPasscode] = useState([]);
  const [firstPin, setFirstPin] = useState('');
  const [step, setStep] = useState('create');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async pinCode => {
    if (!pinCode || pinCode.length !== PIN_LENGTH || isLoading) return;

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
      const payload = response?.data?.data ?? response?.data;
      showToast({
        title: 'Գրանցումը հաջողությամբ կատարվեց',
        body:
          response?.data?.message ??
          payload?.message ??
          'Օգտատերը հաջողությամբ գրանցվել է',
        type: 'success',
      });
      await login();
    } catch (error) {
      console.log('Register personal error:', error);
      setPasscode([]);
      setFirstPin('');
      setStep('create');
      showToast({
        title: 'Գրանցումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeComplete = code => {
    if (isLoading) return;

    if (step === 'create') {
      setFirstPin(code);
      setPasscode([]);
      setStep('confirm');
      return;
    }

    if (code !== firstPin) {
      setPasscode([]);
      setFirstPin('');
      setStep('create');
      showToast({
        title: 'PIN կոդերը չեն համընկնում',
        body: 'Փորձեք կրկին։',
        type: 'error',
      });
      return;
    }

    handleRegister(code);
  };

  const title =
    step === 'confirm' ? 'Կրկնեք ձեր PIN կոդը' : 'Սահմանել PIN կոդը';

  return (
    <AuthScreenLayout style={[styles.screen]}>
      <MainHeader onPress={() => navigation.goBack()} isHome={true} />
      <View style={localStyles.content}>
        <View style={localStyles.formContainer}>
          <ContentTiltes
            title={title}
            subtitle={'Մուտք լինելու համար խնդրում ենք մուտքագրել PIN-ը'}
          />
          <View style={localStyles.passcodeContainer}>
            <Passcode
              hasBiometric={false}
              value={passcode}
              onChange={setPasscode}
              onComplete={handlePasscodeComplete}
            />
          </View>
        </View>
      </View>
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
    passcodeContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
