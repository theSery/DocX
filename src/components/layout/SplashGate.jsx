import { createContext, useContext, useEffect, useState } from 'react';
import { hideSplash } from 'react-native-splash-view';
import { authApi, getRefreshToken, persistAuthResponse, userApi } from '../../api';
import { useAuth } from '../../contexts';
import { hasStoredPinCode } from '../../utils/secureStorage';
import { STORAGE_KEYS } from '../../utils/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPLASH_HOLD_MS = 1500;
const FORCE_401 = true;

/** @typedef {'loading' | 'session' | 'faceId' | 'auth'} AuthRoute */

const SplashContext = createContext({
  isSplashDone: false,
  authRoute: 'loading',
});

export function useSplash() {
  return useContext(SplashContext);
}

async function resolveAuthRoute(isSign) {
  if(!isSign) {
    return 'session';
  }
  try {
    // if (FORCE_401) {
    //   throw { type: 'http', status: 401, message: 'Unauthorized' };
    // }
   const response = await userApi.getMe();
   console.log('response', response);
    return 'session';
  } catch (error) {
    console.log('error 99999999', error.status);
    if (error?.status === 401) {
   
      // const refreshToken = await getRefreshToken();
      return (await hasStoredPinCode()) ? 'faceId' : 'auth';
    }

    // const refreshToken = await getRefreshToken();
    // if (!refreshToken) {
    //   return (await hasStoredPinCode()) ? 'faceId' : 'auth';
    // }

    // try {
    //   const response = await authApi.refreshToken({ refreshToken });
    //   console.log('response', response.data);
    //   await persistAuthResponse(response);
    //   return 'session';
    // } catch (refreshError) {
    //   console.log('refreshError', refreshError);
    //   if (refreshError?.status === 401) {
    //     return (await hasStoredPinCode()) ? 'faceId' : 'auth';
    //   }

    //   return (await hasStoredPinCode()) ? 'faceId' : 'auth';
    // }
  }
}

export function SplashGate({ children }) {
  const { setIsSign, setIsFaceID, removeSign, hasCompletedOnboarding, isSign } = useAuth();
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [authRoute, setAuthRoute] = useState(/** @type {AuthRoute} */ ('loading'));

  useEffect(() => {
    let cancelled = false;

    hideSplash();

    async function bootstrap() {
      // await removeSign();
      const [route] = await Promise.all([
        resolveAuthRoute(isSign),
        new Promise(resolve => setTimeout(resolve, SPLASH_HOLD_MS)),
      ]);

      if (cancelled) {
        return;
      }
 
      setAuthRoute(route);

      if (route === 'auth' && !hasCompletedOnboarding) {
        await setIsSign(false);
        await setIsFaceID(false);
      } else if (route === 'session') {
        await setIsSign(true);
        await setIsFaceID(true);
      } else if (route === 'faceId') {
        await setIsSign(true);
        await setIsFaceID(false);
      } else if(hasCompletedOnboarding){
        await setIsSign(true);
        await setIsFaceID(true);
      }

      setIsSplashDone(true);
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [setIsSign, setIsFaceID, removeSign, hasCompletedOnboarding, isSign]);

  return (
    <SplashContext.Provider value={{ isSplashDone, authRoute }}>
      {children}
    </SplashContext.Provider>
  );
}
