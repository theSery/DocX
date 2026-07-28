import React, { createContext, useContext, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { HOME_STACK_HEADER_COLLAPSE_SCROLL_END } from '../components/headers/stackHeaderConstants';

const HomeStackHeaderScrollContext = createContext(null);

export function HomeStackHeaderScrollProvider({ children }) {
  const scrollY = useSharedValue(0);
  const collapseScrollEnd = useSharedValue(HOME_STACK_HEADER_COLLAPSE_SCROLL_END);
  /** 1 when collapse is allowed (e.g. subcategory item count > threshold). */
  const collapseEnabled = useSharedValue(0);

  // Drive visuals 1:1 from scroll. Lagged withTiming caused stepped jumps
  // during slow scrolls as each tick restarted the timing animation.
  const value = useMemo(
    () => ({
      scrollY,
      smoothScrollY: scrollY,
      collapseScrollEnd,
      collapseEnabled,
    }),
    [scrollY, collapseScrollEnd, collapseEnabled],
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
