import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AuthScreenLayout } from '../../components/layout';
import {
  useAuthScreenStyles,
  useAuthSession,
  useThemedFocusStatusBar,
  useThemedStyles,
  useToast,
} from '../../hooks';
import MainHeader from '../../components/headers/MainHeader';
import {
  getStoredCredentials,
  saveUserCredentials,
} from '../../utils/secureStorage';
import { Passcode } from '../authScreens/signInUP/components/Passcode';
import { ContentTiltes } from '../../components/titleComponents/ContentTiltles';
import { authApi, persistAuthResponse } from '../../api';

const PIN_LENGTH = 4;

export function ResetPinScreen({ navigation, route }) {
  const { email, code } = route.params;
  const styles = useAuthScreenStyles();
  const localStyles = useThemedStyles(createStyles);
  const { showToast } = useToast();
  useThemedFocusStatusBar();
  const { completeReauth } = useAuthSession();
  const [passcode, setPasscode] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const handleComplete = useCallback(
    async pinCode => {
      const newPin = typeof pinCode === 'string' ? pinCode : passcode.join('');
      if (!newPin || newPin.length !== PIN_LENGTH || isLoadingRef.current) {
        return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);

      try {
        await authApi.resetPin({
          email: String(email),
          code: String(code),
          newPin: String(newPin),
        });

        const credentials = await getStoredCredentials();
        const password = credentials?.password;

        if (!password) {
          showToast({
            title: 'PIN-ը թարմացվեց',
            body: 'Խնդրում ենք մուտք գործել նորից։',
            type: 'success',
          });
          return;
        }

        const response = await authApi.login({ email, password });
        await persistAuthResponse(response);
        await saveUserCredentials({
          email,
          password,
          pinCode: newPin,
        });

        showToast({
          title: 'PIN-ը հաջողությամբ թարմացվեց',
          body: 'Դուք հաջողությամբ մուտք եք գործել։',
          type: 'success',
        });

        await completeReauth();
      } catch (error) {
        console.log('Reset PIN error:', error);
        setPasscode([]);
        showToast({
          title: 'PIN-ի թարմացումը ձախողվեց',
          body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
          type: 'error',
        });
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [code, completeReauth, email, passcode, showToast],
  );

  const handlePasscodeChange = useCallback(
    next => {
      if (isLoadingRef.current || isLoading) {
        return;
      }
      setPasscode(next);
    },
    [isLoading],
  );

  return (
    <AuthScreenLayout style={[styles.screen]}>
      <MainHeader onPress={() => navigation.goBack()} isHome={true} />
      <View style={localStyles.content}>
        <View style={localStyles.formContainer}>
          <ContentTiltes
            title={'Սահմանել նոր PIN կոդը'}
            subtitle={'Մուտք լինելու համար խնդրում ենք մուտքագրել նոր PIN-ը'}
          />
          <View style={localStyles.passcodeContainer}>
            <Passcode
              hasBiometric={false}
              value={passcode}
              onChange={handlePasscodeChange}
              onComplete={handleComplete}
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
