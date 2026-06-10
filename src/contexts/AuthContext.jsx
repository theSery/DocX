import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAuthTokens, getAccessToken } from '../api/tokenStorage';
import { STORAGE_KEYS } from '../utils/storageKeys';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isSign, setIsSignState] = useState(false);
  const [isFaceID, setIsFaceIDState] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function hydrate() {
      try {
        const [onboarding, sign] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
          AsyncStorage.getItem(STORAGE_KEYS.SIGN),
        ]);
        setHasCompletedOnboarding(onboarding === 'true');
        const isSignedIn = sign === 'true';
        setIsSignState(isSignedIn);
        if (isSignedIn) {
          await getAccessToken();
        }
      } finally {
        setIsReady(true);
      }
    }
    hydrate();
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
    setHasCompletedOnboarding(true);
  }, []);
  const removeSign = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING);
    setHasCompletedOnboarding(false);
  }, []);
  const setIsSign = useCallback(async value => {
    if (value) {
      await AsyncStorage.setItem(STORAGE_KEYS.SIGN, 'true');
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.SIGN);
      await clearAuthTokens();
      setIsFaceIDState(false);
    }
    setIsSignState(value);
  }, []);

  const setIsFaceID = useCallback(async value => {
    // await AsyncStorage.setItem(STORAGE_KEYS.FACE_ID, value);
    setIsFaceIDState(value);
  }, []);

  const value = useMemo(
    () => ({
      isSign,
      setIsSign,
      hasCompletedOnboarding,
      completeOnboarding,
      isFaceID,
      setIsFaceID,
      isReady,
      removeSign, 
    }),
    [isSign, setIsSign, removeSign, hasCompletedOnboarding, completeOnboarding, isReady, isFaceID, setIsFaceID],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
