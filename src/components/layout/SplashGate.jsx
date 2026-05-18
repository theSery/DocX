import { useEffect } from 'react';
import { hideSplash } from 'react-native-splash-view';

export function SplashGate({ children }) {
  useEffect(() => {
    hideSplash();
  }, []);

  return children;
}
