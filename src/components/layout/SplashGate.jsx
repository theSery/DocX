import { createContext, useContext, useEffect, useState } from 'react';
import { hideSplash } from 'react-native-splash-view';

const SPLASH_HOLD_MS = 1500;

const SplashContext = createContext({ isSplashDone: false });

export function useSplash() {
  return useContext(SplashContext);
}

export function SplashGate({ children }) {
  const [isSplashDone, setIsSplashDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    hideSplash();

    const timer = setTimeout(() => {
      if (!cancelled) {
        setIsSplashDone(true);
      }
    }, SPLASH_HOLD_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <SplashContext.Provider value={{ isSplashDone }}>
      {children}
    </SplashContext.Provider>
  );
}
