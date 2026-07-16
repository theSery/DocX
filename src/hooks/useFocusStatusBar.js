import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Platform, StatusBar } from 'react-native';
import { useTheme } from './useTheme';

export function useFocusStatusBar(barStyle, backgroundColor) {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(barStyle, true);
      // On iOS the status bar is transparent; its color comes from the view
      // behind it, so setBackgroundColor only exists on Android.
      if (backgroundColor != null && Platform.OS === 'android') {
        StatusBar.setBackgroundColor(backgroundColor);
      }
    }, [barStyle, backgroundColor]),
  );
}

export function useThemedFocusStatusBar() {
  const { isDarkMode, colors } = useTheme();
  const barStyle = isDarkMode ? 'light-content' : 'dark-content';

  useFocusStatusBar(barStyle, colors.background);
}
