import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts';
import { useSplash } from '../components/layout/SplashGate';
import { AuthNavigator } from './AuthStacks/AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { OnboardingScreen } from '../screens/authScreens';
import GradientBackground from '../components/GradientBackground';
import LogoIcon from '../components/icons/LogoIcon';
import LottieAnimation from '../components/animation/LottieAnimation';
import { FaceIdScreen } from '../screens/main/home/FaceIdScreen';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchCategoryHierarchy,
  selectCategoriesStatus,
} from '../store/slices/categoriesSlice';
import { animation } from './constants';


const Stack = createNativeStackNavigator();

function resolveInitialRoute(hasCompletedOnboarding, startupRoute) {
  if (!hasCompletedOnboarding) {
    return 'Onboarding';
  }

  if (startupRoute === 'faceId') {
    return 'FaceId';
  }

  return 'Main';
}

export function RootNavigator() {
  const { isReady, hasCompletedOnboarding } = useAuth();
  const { isSplashDone, startupRoute } = useSplash();

  const dispatch = useAppDispatch();
  const categoriesStatus = useAppSelector(selectCategoriesStatus);

  useEffect(() => {
    if (categoriesStatus === 'idle') {
      dispatch(fetchCategoryHierarchy({ page: 1, limit: 10 }));
    }
  }, [dispatch, categoriesStatus]);

  const isBootstrapping = categoriesStatus !== 'succeeded';

  useEffect(() => {
    if (!isSplashDone || !isReady || isBootstrapping) {
      StatusBar.setBarStyle('light-content', true);
    }
  }, [isSplashDone, isReady, isBootstrapping]);

  if (!isSplashDone || !isReady || isBootstrapping) {
    return (
      <GradientBackground isLight={false}>
        <LottieAnimation
          source={require('../assets/lottie/Law.json')}
          autoPlay
          loop
          style={{
            width: 150,
            height: 150,
            position: 'absolute',
            bottom: 30,
            left: 30,
          }}
        />
        <LogoIcon width={140} height={140} />
      </GradientBackground>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={resolveInitialRoute(hasCompletedOnboarding, startupRoute)}
      screenOptions={{ headerShown: false, animation }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="FaceId" component={FaceIdScreen} />
    </Stack.Navigator>
  );
}
