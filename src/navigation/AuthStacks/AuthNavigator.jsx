import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from './AuthContext';
import { AccountTypeScreen } from './AccountTypeScreen';
import { OnboardingScreen } from './OnboardingScreen';
import { PinCodeScreen } from './PinCodeScreen';
import { RegistrationScreen } from './RegistrationScreen';
import { SignInUpScreen } from './SignInUpScreen';
import { VerificationScreen } from './VerificationScreen';

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
