import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LightThemeScope } from '../../theme';
import {
  RegistrationScreen,
  SignInUpScreen,
} from '../../screens/authScreens';
import { AccountTypeScreen } from '../../screens/authScreens/signInUP/AccountTypeScreen';
import { EmailVerificationScreen } from '../../screens/authScreens/signInUP/EmailVerificationScreen';
import { PinCodeScreen } from '../../screens/authScreens/signInUP/PinCodeScreen';

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  return (
    // <LightThemeScope>
      <Stack.Navigator
        initialRouteName="AccountType"
        screenOptions={{
          headerShown: false,
          // animation: 'fade',
        }}>
        <Stack.Screen name="AccountType" component={AccountTypeScreen} />
        <Stack.Screen name="SignInUp" component={SignInUpScreen} />
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        <Stack.Screen name="PinCode" component={PinCodeScreen} />
      </Stack.Navigator>
    // </LightThemeScope>
  );
}
