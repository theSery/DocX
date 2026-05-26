import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts';
import { LightThemeScope } from '../../theme';
import {
  OnboardingScreen,
  RegistrationScreen,
  SignInUpScreen,
} from '../../screens/authScreens';
import { AccountTypeScreen } from '../../screens/authScreens/signInUP/AccountTypeScreen';
import { EmailVerificationScreen } from '../../screens/authScreens/signInUP/EmailVerificationScreen';
import { PinCodeScreen } from '../../screens/authScreens/signInUP/PinCodeScreen';
const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  const { hasCompletedOnboarding } = useAuth();

  return (
    <LightThemeScope>
      <Stack.Navigator
        initialRouteName={hasCompletedOnboarding ? 'AccountType' : 'Onboarding'}
        screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: 'white' } }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="AccountType" component={AccountTypeScreen} />
        <Stack.Screen name="SignInUp" component={SignInUpScreen} />
        <Stack.Screen name="Registration"  component={RegistrationScreen}  />
        <Stack.Screen name="EmailVerification"  component={EmailVerificationScreen} />
        <Stack.Screen name="PinCode" component={PinCodeScreen} />
      </Stack.Navigator>
    </LightThemeScope>
  );
}
