import { createContext, useContext, useEffect, useState } from 'react';
import { hideSplash } from 'react-native-splash-view';
import { authApi, getRefreshToken, persistAuthResponse, userApi } from '../../api';
import { useAuth } from '../../contexts';
import { hasStoredPinCode } from '../../utils/secureStorage';

const SPLASH_HOLD_MS = 1500;

/** @typedef {'loading' | 'session' | 'faceId' | 'auth'} AuthRoute */

const SplashContext = createContext({
  isSplashDone: false,
  authRoute: 'loading',
});

export function useSplash() {
  return useContext(SplashContext);
}

async function resolveAuthRoute() {
  try {
   const response = await userApi.getMe();
   console.log('response', response);
    return 'session';
  } catch (error) {
    if (error?.status !== 401) {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return (await hasStoredPinCode()) ? 'faceId' : 'auth';
      }
    }

    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return (await hasStoredPinCode()) ? 'faceId' : 'auth';
    }

    try {
      const response = await authApi.refreshToken({ refreshToken });
      await persistAuthResponse(response);
      return 'session';
    } catch (refreshError) {
      if (refreshError?.status === 401) {
        return (await hasStoredPinCode()) ? 'faceId' : 'auth';
      }

      return (await hasStoredPinCode()) ? 'faceId' : 'auth';
    }
  }
}

export function SplashGate({ children }) {
  const { setIsSign, setIsFaceID } = useAuth();
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [authRoute, setAuthRoute] = useState(/** @type {AuthRoute} */ ('loading'));

  useEffect(() => {
    let cancelled = false;

    hideSplash();

    async function bootstrap() {
      const [route] = await Promise.all([
        resolveAuthRoute(),
        new Promise(resolve => setTimeout(resolve, SPLASH_HOLD_MS)),
      ]);

      if (cancelled) {
        return;
      }

      setAuthRoute(route);

      if (route === 'auth') {
        await setIsSign(false);
        await setIsFaceID(false);
      } else if (route === 'session') {
        await setIsSign(true);
        await setIsFaceID(true);
      } else {
        await setIsSign(true);
        await setIsFaceID(false);
      }

      setIsSplashDone(true);
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [setIsSign, setIsFaceID]);

  return (
    <SplashContext.Provider value={{ isSplashDone, authRoute }}>
      {children}
    </SplashContext.Provider>
  );
}
