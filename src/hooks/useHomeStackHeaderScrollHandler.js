import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useHomeStackHeaderScroll } from '../context/HomeStackHeaderScrollContext';
import {
  HOME_STACK_HEADER_COLLAPSE_DISTANCE,
  HOME_STACK_HEADER_COLLAPSE_DISTANCE_EXTRA,
  HOME_STACK_HEADER_COLLAPSE_SCROLL_END,
  HOME_STACK_HEADER_COLLAPSE_START,
} from '../components/headers/stackHeaderConstants';

export function useHomeStackHeaderScrollHandler(enabled = true) {
  const { scrollY, collapseScrollEnd } = useHomeStackHeaderScroll();
  const viewportHeight = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return;
      }
      scrollY.value = 0;
      collapseScrollEnd.value = HOME_STACK_HEADER_COLLAPSE_SCROLL_END;
      viewportHeight.value = 0;
    }, [scrollY, collapseScrollEnd, viewportHeight, enabled]),
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = Math.max(0, event.contentOffset.y);
    },
  });

  const onScrollViewLayout = useCallback(
    event => {
      if (!enabled) {
        return;
      }
      viewportHeight.value = event.nativeEvent.layout.height;
    },
    [enabled, viewportHeight],
  );

  const onContentSizeChange = useCallback(
    (_width, contentHeight) => {
      if (!enabled) {
        return;
      }

      const viewport = viewportHeight.value;
      if (viewport <= 0) {
        return;
      }

      const overflow = contentHeight - viewport;
      if (overflow > 32) {
        collapseScrollEnd.value =
          HOME_STACK_HEADER_COLLAPSE_START +
          HOME_STACK_HEADER_COLLAPSE_DISTANCE +
          Math.min(
            overflow * 0.45,
            HOME_STACK_HEADER_COLLAPSE_DISTANCE_EXTRA,
          );
      } else {
        collapseScrollEnd.value = HOME_STACK_HEADER_COLLAPSE_SCROLL_END;
      }
    },
    [collapseScrollEnd, enabled, viewportHeight],
  );

  if (!enabled) {
    return {
      onScroll: undefined,
      onScrollViewLayout: undefined,
      onContentSizeChange: undefined,
    };
  }

  return {
    onScroll,
    onScrollViewLayout,
    onContentSizeChange,
  };
}
