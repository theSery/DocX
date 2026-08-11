import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  RegistrationScreen,
  SignInUpScreen,
} from '../../screens/authScreens';
import { AccountTypeScreen } from '../../screens/authScreens/signInUP/AccountTypeScreen';
import { EmailVerificationScreen } from '../../screens/authScreens/signInUP/EmailVerificationScreen';
import { PinCodeScreen } from '../../screens/authScreens/signInUP/PinCodeScreen';
import { ResetPasswordScreen } from '../../screens/authScreens/signInUP/ResetPasswordScreen';
import { animation } from '../constants';

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  return (
    // <LightThemeScope>
      <Stack.Navigator
        initialRouteName="AccountType"
        screenOptions={{
          headerShown: false,
          animation,
        }}>
        <Stack.Screen name="AccountType" component={AccountTypeScreen} />
        <Stack.Screen name="SignInUp" component={SignInUpScreen} />
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="PinCode" component={PinCodeScreen} />
      </Stack.Navigator>
    // </LightThemeScope>
  );
}
