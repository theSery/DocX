import { Dimensions, Platform } from 'react-native';
import { Easing, SharedTransition } from 'react-native-reanimated';

export const WIDTH = Dimensions.get('window').width;
export const HEIGHT = Dimensions.get('window').height;

export const ITEM_HEIGHT = HEIGHT * 0.2;

export const TAB_BAR_HEIGHT = 60;
export const AUTH_BUTTON_HEIGHT = 45;
const TAB_BAR_BOTTOM_OFFSET = 10;

export const PADDING_B = Platform.select({
  ios: 14,
  android: 24,
});

export function getTabBarOffset(insets) {
  return (
    Math.max(0, insets.bottom - TAB_BAR_BOTTOM_OFFSET) +
    TAB_BAR_HEIGHT +
    PADDING_B
  );
}

export function getBottomInset(insets, buttonHeight = 0) {
  return getTabBarOffset(insets) + buttonHeight;
}

export const customTransition = SharedTransition.duration(500).easing(
  Easing.bezier(0.25, 0.1, 0.25, 1.0),
);
export const customTransition2 = SharedTransition.duration(500).easing(
  Easing.bezier(0.25, 0.1, 0.25, 1.0),
);
SharedTransition.duration(400).easing(
  Easing.inOut(Easing.exp) // Медленный старт, очень быстрый рывок, медленный финиш
);
export const customTransitionQuad = SharedTransition.duration(500).easing(
  Easing.out(Easing.quad) // Плавное замедление в конце
);

export const customTransitionExp = SharedTransition.duration(400).easing(
  Easing.inOut(Easing.exp) // Медленный старт, очень быстрый рывок, медленный финиш
);