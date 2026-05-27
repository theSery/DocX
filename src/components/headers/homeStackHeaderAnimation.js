import { Extrapolation, interpolate } from 'react-native-reanimated';
import { HOME_STACK_HEADER_COLLAPSE_START } from './homeStackHeaderConstants';

function easeOutCubic(t) {
  'worklet';
  return 1 - (1 - t) ** 3;
}

/** Maps scroll offset to 0–1 collapse progress with a delayed start and ease-out. */
export function getHomeStackHeaderCollapseProgress(scrollY, collapseScrollEnd) {
  'worklet';
  const linear = interpolate(
    scrollY,
    [HOME_STACK_HEADER_COLLAPSE_START, collapseScrollEnd],
    [0, 1],
    Extrapolation.CLAMP,
  );
  return easeOutCubic(linear);
}
