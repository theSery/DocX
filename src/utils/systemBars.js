import { NativeModules, Platform } from 'react-native';

/**
 * Keeps Android status and navigation bars transparent, and matches icon
 * contrast to the surface behind them (`lightIcons` for dark backgrounds).
 */
export function setAndroidSystemBars(lightIcons) {
  if (Platform.OS !== 'android') {
    return;
  }

  NativeModules.SystemBars?.setLightIcons(Boolean(lightIcons));
}
