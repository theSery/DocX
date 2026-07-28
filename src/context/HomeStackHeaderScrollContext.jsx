import React, { createContext, useContext, useMemo } from 'react';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  HOME_STACK_HEADER_COLLAPSE_ANIMATION,
  HOME_STACK_HEADER_COLLAPSE_SCROLL_END,
} from '../components/headers/stackHeaderConstants';

const collapseEasing = Easing.bezier(0.22, 1, 0.36, 1);

const HomeStackHeaderScrollContext = createContext(null);

export function HomeStackHeaderScrollProvider({ children }) {
  const scrollY = useSharedValue(0);
  const collapseScrollEnd = useSharedValue(HOME_STACK_HEADER_COLLAPSE_SCROLL_END);
  /** 1 when list content overflows enough to justify collapsing the header. */
  const collapseEnabled = useSharedValue(0);

  // Shared smooth follow so header + screen chrome stay in lockstep.
  // Short duration keeps motion polished without the old lag/jitter loop.
  const smoothScrollY = useDerivedValue(() =>
    withTiming(scrollY.value, {
      duration: HOME_STACK_HEADER_COLLAPSE_ANIMATION.duration,
      easing: collapseEasing,
    }),
  );

  const value = useMemo(
    () => ({ scrollY, smoothScrollY, collapseScrollEnd, collapseEnabled }),
    [scrollY, smoothScrollY, collapseScrollEnd, collapseEnabled],
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
