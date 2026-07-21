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
import AuthButton from '../../../components/buttons/AuthButton';
import { saveUserCredentials } from '../../../utils/secureStorage';
import { Passcode } from './components/Passcode';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { authApi, persistAuthResponse } from '../../../api';

export function PinCodeScreen({ navigation, route }) {
  const { name, surname, patronymic, email, password } = route.params;
  const styles = useAuthScreenStyles();
  const localStyles = useThemedStyles(createStyles);
  const { showToast } = useToast();
  useThemedFocusStatusBar();
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
    <AuthScreenLayout style={[styles.screen]}>
      <MainHeader onPress={() => navigation.goBack()} isHome={true} />
      <View style={localStyles.content}>
        <View style={localStyles.formContainer}>
          <ContentTiltes
            title={'Սահմանել PIN կոդը'}
            subtitle={'Մուտք լինելու համար խնդրում ենք մուտքագրել PIN-ը'}
          />
          <View style={localStyles.passcodeContainer}>
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
