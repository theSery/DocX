import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hideSplash } from 'react-native-splash-view';
import { userApi } from '../../api';
import { useAuth } from '../../contexts';
import { STORAGE_KEYS } from '../../utils/storageKeys';

const SPLASH_HOLD_MS = 1500;

/** @typedef {'main' | 'faceId'} StartupRoute */

const SplashContext = createContext({
  isSplashDone: false,
  startupRoute: /** @type {StartupRoute} */ ('main'),
});

export function useSplash() {
  return useContext(SplashContext);
}

async function resolveStartupRoute(wasSignedIn) {
  if (!wasSignedIn) {
    return 'main';
  }

  try {
    await userApi.getMe();

    return 'main';
  } catch (error) {
    if (error?.status === 401) {
      return 'faceId';
    }
    return 'main';
  }
}

export function SplashGate({ children }) {
  const { setIsSign, setIsFaceID } = useAuth();
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [startupRoute, setStartupRoute] = useState(/** @type {StartupRoute} */ ('main'));

  useEffect(() => {
    let cancelled = false;

    hideSplash();

    async function bootstrap() {
      const sign = await AsyncStorage.getItem(STORAGE_KEYS.SIGN);
      const wasSignedIn = sign === 'true';

      const [route] = await Promise.all([
        resolveStartupRoute(wasSignedIn),
        new Promise(resolve => setTimeout(resolve, SPLASH_HOLD_MS)),
      ]);

      if (cancelled) {
        return;
      }

      if (route === 'faceId') {
        await setIsSign(true);
        await setIsFaceID(false);
      } else if (wasSignedIn) {
        await setIsSign(true);
        await setIsFaceID(true);
      } else {
        await setIsSign(false);
        await setIsFaceID(false);
      }

      setStartupRoute(route);
      setIsSplashDone(true);
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [setIsSign, setIsFaceID]);

  return (
    <SplashContext.Provider value={{ isSplashDone, startupRoute }}>
      {children}
    </SplashContext.Provider>
  );
}
