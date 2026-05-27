import React, { createContext, useContext, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { HOME_STACK_HEADER_COLLAPSE_SCROLL_END } from '../components/headers/homeStackHeaderConstants';

const HomeStackHeaderScrollContext = createContext(null);

export function HomeStackHeaderScrollProvider({ children }) {
  const scrollY = useSharedValue(0);
  const collapseScrollEnd = useSharedValue(HOME_STACK_HEADER_COLLAPSE_SCROLL_END);
  const value = useMemo(
    () => ({ scrollY, collapseScrollEnd }),
    [scrollY, collapseScrollEnd],
  );

  return (
    <HomeStackHeaderScrollContext.Provider value={value}>
      {children}
    </HomeStackHeaderScrollContext.Provider>
  );
}

export function useHomeStackHeaderScroll() {
  const context = useContext(HomeStackHeaderScrollContext);
  if (!context) {
    throw new Error(
      'useHomeStackHeaderScroll must be used within HomeStackHeaderScrollProvider',
    );
  }
  return context;
}
