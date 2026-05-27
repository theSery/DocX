import { Dimensions } from 'react-native';
import { Easing, SharedTransition } from 'react-native-reanimated';

export const WIDTH = Dimensions.get('window').width;
export const HEIGHT = Dimensions.get('window').height;

export const ITEM_HEIGHT = HEIGHT * 0.2;

export const customTransition = SharedTransition.duration(500).easing(
  Easing.bezier(0.25, 0.1, 0.25, 1.0),
);
export const customTransition2 = SharedTransition.duration(500).easing(
  Easing.bezier(0.25, 0.1, 0.25, 1.0),
);

