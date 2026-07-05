import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from './useTheme';

export function useFocusStatusBar(barStyle, backgroundColor) {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(barStyle, true);
      if (backgroundColor != null) {
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
