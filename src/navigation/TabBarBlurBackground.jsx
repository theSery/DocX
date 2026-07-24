import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { GLASS } from '../components/glass/glassConfig';
import { useTheme } from '../hooks';
import { TAB_BAR_BOTTOM_OFFSET, TAB_BAR_HEIGHT } from '../utils/dimensions';

/**
 * Visual-only blur plate for BottomTabBar `tabBarBackground`.
 * No children — background layer only; does not receive touches.
 */
export function TabBarBlurBackground() {
  const { isDarkMode } = useTheme();
  const glass = useMemo(
    () => (isDarkMode ? GLASS.dark : GLASS.light),
    [isDarkMode],
  );
  const blurType = isDarkMode ? 'dark' : 'light';
  const blurAmount = isDarkMode ? 24 :1;

  return (
    // <View style={styles.blurLayer}>

    // </View>
   
    <BlurView
      pointerEvents="none"
      style={[styles.blurLayer,     {
        // borderColor: glass.border,
        height: TAB_BAR_HEIGHT,
      },]}
      blurType={blurType}
      blurAmount={blurAmount}
      overlayColor={glass.overlayColor}
      reducedTransparencyFallbackColor={glass.fallback}
      ignoreSafeArea
    />
  );
}

const styles = StyleSheet.create({
  blurLayer: {
    // ...StyleSheet.absoluteFill,
    zIndex: 1,
    // elevation: 0,
    position: 'absolute',
    bottom: 15 ,
    left: 20,
    right: 20,
    // height: 100,
    width: '92%',
    // backgroundColor: 'red',
    // bottom: 100,
    // marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
