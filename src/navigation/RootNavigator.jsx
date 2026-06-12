import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts';
import { useSplash } from '../components/layout/SplashGate';
import { AuthNavigator } from './authStacks/AuthNavigator';
import { TabNavigator } from './TabNavigator';
import GradientBackground from '../components/GradientBackground';
import LogoIcon from '../components/icons/LogoIcon';
import LottieAnimation from '../components/animation/LottieAnimation';
import { FaceIdScreen } from '../screens/main/home/FaceIdScreen';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchCategoryHierarchy,
  selectCategoriesStatus,
} from '../store/slices/categoriesSlice';


const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { isReady, isFaceID, isSign } = useAuth();
  const { isSplashDone, authRoute } = useSplash();

  const dispatch = useAppDispatch();
  const categoriesStatus = useAppSelector(selectCategoriesStatus);
  // const func = async () => {
  //   const credentials = await getUserCredentialsWithBiometric();
  //   console.log('credentials', credentials);
  // }
  useEffect(() => {
    if (categoriesStatus === 'idle') {
      dispatch(fetchCategoryHierarchy({ page: 1, limit: 10 }));
    }
    // func();
  }, [dispatch, categoriesStatus]);

  const isBootstrapping = categoriesStatus !== 'succeeded';

  if (!isSplashDone || !isReady || isBootstrapping) {
    return (
      <GradientBackground isLight={false}>
        <LottieAnimation source={require('../assets/lottie/Law.json')} autoPlay loop style={{ width: 150, height: 150, position: 'absolute', bottom: 30, left: 30 }} />
        <LogoIcon width={140} height={140} />
      </GradientBackground>
    );
  }

  const showMainApp =
    authRoute === 'session' || (authRoute === 'faceId' && isFaceID);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false,  }}>
      
      {!isSign ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : showMainApp ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <Stack.Screen name="FaceId" component={FaceIdScreen} />
        // <Stack.Screen name="Main" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
}


