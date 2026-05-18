import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@docx/onboarding_complete';
const SIGN_KEY = '@docx/is_sign';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isSign, setIsSignState] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function hydrate() {
      try {
        const [onboarding, sign] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(SIGN_KEY),
        ]);
        setHasCompletedOnboarding(onboarding === 'true');
        setIsSignState(sign === 'true');
      } finally {
        setIsReady(true);
      }
    }
    hydrate();
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasCompletedOnboarding(true);
  }, []);

  const setIsSign = useCallback(async value => {
    if (value) {
      await AsyncStorage.setItem(SIGN_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(SIGN_KEY);
    }
    setIsSignState(value);
  }, []);

  const value = useMemo(
    () => ({
      isSign,
      setIsSign,
      hasCompletedOnboarding,
      completeOnboarding,
      isReady,
    }),
    [isSign, setIsSign, hasCompletedOnboarding, completeOnboarding, isReady],
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
