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
import {
  fetchComplaints,
  selectComplaintsStatus,
} from '../store/slices/complaintsSlice';
import {
  fetchPersonalDocuments,
  selectPersonalDocumentsStatus,
} from '../store/slices/personalDocumentsSlice';
import { prefetchCategoryIcons } from '../utils/imageCache';
import { animation } from './constants';
import { ResetPinNavigator } from './AuthStacks/ResetPinNavigator';

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
  const categories = useAppSelector(selectCategories);
  const categoriesStatus = useAppSelector(selectCategoriesStatus);
  const personalDocumentsStatus = useAppSelector(selectPersonalDocumentsStatus);
  const complaintsStatus = useAppSelector(selectComplaintsStatus);
  const [criticalIconsReady, setCriticalIconsReady] = useState(false);

  useEffect(() => {
    if (categoriesStatus === 'idle') {
      dispatch(fetchCategoryHierarchy({ page: 1, limit: 10 }));
    }
  }, [dispatch, categoriesStatus]);

  useEffect(() => {
    if (personalDocumentsStatus === 'idle') {
      dispatch(fetchPersonalDocuments({ page: 1, limit: 100 }));
    }
  }, [dispatch, personalDocumentsStatus]);

  useEffect(() => {
    if (complaintsStatus === 'idle') {
      dispatch(fetchComplaints({ page: 1, limit: 100 }));
    }
  }, [dispatch, complaintsStatus]);

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

  const isBootstrapping =
    categoriesStatus === 'idle' ||
    categoriesStatus === 'loading' ||
    (categoriesStatus === 'succeeded' && !criticalIconsReady);

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
      // initialRouteName="FaceId"
      screenOptions={{ headerShown: false, animation }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="FaceId" component={ResetPinNavigator} />
    </Stack.Navigator>
  );
}
