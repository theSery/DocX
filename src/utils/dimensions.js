import { Dimensions, Platform } from 'react-native';
import { Easing, SharedTransition } from 'react-native-reanimated';
import { initialWindowMetrics } from 'react-native-safe-area-context';

export const WIDTH = Dimensions.get('window').width;
export const HEIGHT = Dimensions.get('window').height;

export const ITEM_HEIGHT = HEIGHT * 0.2;

export const TAB_BAR_HEIGHT = 60;
export const AUTH_BUTTON_HEIGHT = 45;

export const PADDING_B = Platform.select({
  ios: 14,
  android: 24,
});

const TAB_BAR_INSET_ADJUSTMENT = 10;
const initialBottomInset = initialWindowMetrics?.insets.bottom ?? 0;

export const TAB_BAR_BOTTOM_OFFSET =
  Math.max(0, initialBottomInset - TAB_BAR_INSET_ADJUSTMENT) +
  TAB_BAR_HEIGHT +
  PADDING_B;


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