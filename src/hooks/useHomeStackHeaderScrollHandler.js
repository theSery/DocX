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

/**
 * @param {boolean} enabled When false, header stays expanded (e.g. ≤8 subcategory items).
 */
export function useHomeStackHeaderScrollHandler(enabled = true) {
  const { scrollY, collapseScrollEnd, collapseEnabled } =
    useHomeStackHeaderScroll();
  const viewportHeight = useSharedValue(0);
  const contentHeightSV = useSharedValue(0);

  const updateCollapseRange = useCallback(() => {
    if (!enabled) {
      return;
    }

    const viewport = viewportHeight.value;
    const contentHeight = contentHeightSV.value;
    if (viewport <= 0 || contentHeight <= 0) {
      return;
    }

    const overflow = Math.max(0, contentHeight - viewport);
    collapseScrollEnd.value =
      HOME_STACK_HEADER_COLLAPSE_START +
      HOME_STACK_HEADER_COLLAPSE_DISTANCE +
      Math.min(overflow * 0.45, HOME_STACK_HEADER_COLLAPSE_DISTANCE_EXTRA);
  }, [
    collapseScrollEnd,
    contentHeightSV,
    enabled,
    viewportHeight,
  ]);

  useFocusEffect(
    useCallback(() => {
      scrollY.value = 0;
      collapseScrollEnd.value = HOME_STACK_HEADER_COLLAPSE_SCROLL_END;
      collapseEnabled.value = enabled ? 1 : 0;
      viewportHeight.value = 0;
      contentHeightSV.value = 0;
    }, [
      scrollY,
      collapseScrollEnd,
      collapseEnabled,
      viewportHeight,
      contentHeightSV,
      enabled,
    ]),
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      const y = Math.max(0, event.contentOffset.y);
      scrollY.value = collapseEnabled.value > 0.5 ? y : 0;
    },
  });

  const onScrollViewLayout = useCallback(
    event => {
      if (!enabled) {
        return;
      }
      viewportHeight.value = event.nativeEvent.layout.height;
      updateCollapseRange();
    },
    [enabled, updateCollapseRange, viewportHeight],
  );

  const onContentSizeChange = useCallback(
    (_width, contentHeight) => {
      if (!enabled) {
        return;
      }
      contentHeightSV.value = contentHeight;
      updateCollapseRange();
    },
    [contentHeightSV, enabled, updateCollapseRange],
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
