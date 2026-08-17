import { useEffect, useState } from 'react';
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
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchCategoryHierarchy,
  selectCategories,
  selectCategoriesStatus,
} from '../store/slices/categoriesSlice';
import { prefetchCategoryIcons } from '../utils/imageCache';
import { animation } from './constants';
import { ResetPinNavigator } from './AuthStacks/ResetPinNavigator';

const Stack = createNativeStackNavigator();

const CATEGORIES_PAGE = { page: 1, limit: 10 };

function resolveInitialRoute(hasCompletedOnboarding, startupRoute) {
  if (!hasCompletedOnboarding) {
    return 'Onboarding';
  }

  if (startupRoute === 'faceId') {
    return 'FaceId';
  }

  return 'Main';
}

function BootstrapLoadingScreen() {
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

export function RootNavigator() {
  const { isReady, hasCompletedOnboarding } = useAuth();
  const { isSplashDone, startupRoute } = useSplash();

  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const categoriesStatus = useAppSelector(selectCategoriesStatus);

  const [criticalIconsReady, setCriticalIconsReady] = useState(false);

  useEffect(() => {
    if (categoriesStatus === 'idle') {
      dispatch(fetchCategoryHierarchy(CATEGORIES_PAGE));
    }
  }, [dispatch, categoriesStatus]);

  useEffect(() => {
    if (categoriesStatus === 'failed') {
      setCriticalIconsReady(true);
      return undefined;
    }

    if (categoriesStatus !== 'succeeded') {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        await prefetchCategoryIcons(categories);
      } finally {
        if (!cancelled) {
          setCriticalIconsReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [categoriesStatus, categories]);

  const isCategoriesBootstrapping =
    categoriesStatus === 'idle' ||
    categoriesStatus === 'loading' ||
    (categoriesStatus === 'succeeded' && !criticalIconsReady);

  const isAppLoading = !isSplashDone || !isReady || isCategoriesBootstrapping;

  useEffect(() => {
    if (isAppLoading) {
      StatusBar.setBarStyle('light-content', true);
    }
  }, [isAppLoading]);

  if (isAppLoading) {
    return <BootstrapLoadingScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName={resolveInitialRoute(hasCompletedOnboarding, startupRoute)}
      // initialRouteName="FaceId"
      screenOptions={{ headerShown: false, animation }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="FaceId" component={ResetPinNavigator} />
    </Stack.Navigator>
  );
}
