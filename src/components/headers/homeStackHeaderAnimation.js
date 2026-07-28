import { Extrapolation, interpolate } from 'react-native-reanimated';
import {
  HOME_STACK_HEADER_COLLAPSE_START,
  HOME_STACK_HEADER_COLLAPSED_HEIGHT,
  HOME_STACK_HEADER_EXPANDED_HEIGHT,
} from './stackHeaderConstants';

/**
 * Maps scroll offset to 0–1 collapse progress.
 * When `collapseEnabled` is 0 (short list), progress stays at 0.
 */
export function getHomeStackHeaderCollapseProgress(
  scrollY,
  collapseScrollEnd,
  collapseEnabled = 1,
) {
  'worklet';
  if (collapseEnabled < 0.5) {
    return 0;
  }
  return interpolate(
    scrollY,
    [HOME_STACK_HEADER_COLLAPSE_START, collapseScrollEnd],
    [0, 1],
    Extrapolation.CLAMP,
  );
}

/** Header height for a given collapse progress (0 = expanded, 1 = collapsed). */
export function getHomeStackHeaderHeight(progress, showSearch = true) {
  'worklet';
  const expanded = showSearch
    ? HOME_STACK_HEADER_EXPANDED_HEIGHT
    : HOME_STACK_HEADER_EXPANDED_HEIGHT - HOME_STACK_HEADER_COLLAPSED_HEIGHT;
  const collapsed = showSearch ? HOME_STACK_HEADER_COLLAPSED_HEIGHT : 0;
  return interpolate(progress, [0, 1], [expanded, collapsed], Extrapolation.CLAMP);
}
