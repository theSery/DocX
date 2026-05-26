import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts';
import { useSplash } from '../components/layout/SplashGate';
import { AuthNavigator } from './authStacks/AuthNavigator';
import { TabNavigator } from './TabNavigator';
import GradientBackground from '../components/GradientBackground';
import LogoIcon from '../components/icons/LogoIcon';
import LottieAnimation from '../components/animation/LottieAnimation';
import { PinCodeScreen } from '../screens/authScreens';
import { FaceIdScreen } from '../screens/main/home/FaceIdScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { isSign, isReady, isFaceID } = useAuth();
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
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {isSign ? (   <Stack.Screen name="Main" component={TabNavigator} />
        // isFaceID ? (
        //   <Stack.Screen name="Main" component={TabNavigator} />
        // ) : (
        //   <Stack.Screen name="FaceId" component={FaceIdScreen} />
        // )
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}


