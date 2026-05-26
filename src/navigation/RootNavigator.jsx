import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts';
import { useSplash } from '../components/layout/SplashGate';
import { AuthNavigator } from './authStacks/AuthNavigator';
import { TabNavigator } from './TabNavigator';
import GradientBackground from '../components/GradientBackground';
import LogoIcon from '../components/icons/LogoIcon';
import LottieAnimation from '../components/animation/LottieAnimation';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { isSign, isReady } = useAuth();
  const { isSplashDone } = useSplash();

  if (!isSplashDone || !isReady) {
    return (
      <GradientBackground isLight={false}>
        <LottieAnimation source={require('../assets/lottie/Law.json')} autoPlay loop style={{ width: 150, height: 150, position: 'absolute', bottom: 30, left: 30 }} />
        <LogoIcon width={140} height={140} />
      </GradientBackground>
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


