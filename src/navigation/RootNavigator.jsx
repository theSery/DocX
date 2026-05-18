import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts';
import { useTheme } from '../hooks';
import { AuthNavigator } from './authStacks/AuthNavigator';
import { TabNavigator } from './TabNavigator';
import OnboardingBackground from '../components/OnboardingBackground';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { isSign, isReady } = useAuth();
  const { colors } = useTheme();

  if (!isReady) {
    return (
      <OnboardingBackground />
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSign ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
