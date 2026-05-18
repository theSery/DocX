import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts';
import {
  AccountTypeScreen,
  OnboardingScreen,
  PinCodeScreen,
  RegistrationScreen,
  SignInUpScreen,
  VerificationScreen,
} from '../../screens/authScreens';

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  const { hasCompletedOnboarding } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={hasCompletedOnboarding ? 'SignInUp' : 'Onboarding'}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="AccountType" component={AccountTypeScreen} />
      <Stack.Screen name="SignInUp" component={SignInUpScreen} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="PinCode" component={PinCodeScreen} />
    </Stack.Navigator>
  );
}
