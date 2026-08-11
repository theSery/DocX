import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Platform, StatusBar } from 'react-native';
import { useTheme } from './useTheme';

export function useFocusStatusBar(barStyle, backgroundColor, enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return;
      }

      StatusBar.setBarStyle(barStyle, true);
      // On iOS the status bar is transparent; its color comes from the view
      // behind it, so setBackgroundColor only exists on Android.
      if (backgroundColor != null && Platform.OS === 'android') {
        StatusBar.setBackgroundColor(backgroundColor);
      }
    }, [barStyle, backgroundColor, enabled]),
  );
}

export function useThemedFocusStatusBar() {
  const { isDarkMode, colors, isAnimating } = useTheme();
  const barStyle = isDarkMode ? 'light-content' : 'dark-content';

  // Skip while the circular reveal runs so Android status-bar chrome
  // doesn't jump ahead of the Skia overlay.
  useFocusStatusBar(barStyle, colors.background, !isAnimating);
}

/**
 * Theme-aware status bar while focused (same as Home / useThemedFocusStatusBar),
 * then restores another style on blur (default light-content for account stack).
 */
export function useTemporaryFocusStatusBar(
  focusedStyle,
  restoredStyle = 'light-content',
) {
  const { isDarkMode } = useTheme();
  const resolvedFocusedStyle =
    focusedStyle ?? (isDarkMode ? 'light-content' : 'dark-content');

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(resolvedFocusedStyle, true);
      return () => {
        StatusBar.setBarStyle(restoredStyle, true);
      };
    }, [resolvedFocusedStyle, restoredStyle]),
  );
}
