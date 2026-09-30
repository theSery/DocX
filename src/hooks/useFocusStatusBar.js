import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Platform, StatusBar } from 'react-native';
import { setAndroidSystemBars } from '../utils/systemBars';
import { useTheme } from './useTheme';

export function useFocusStatusBar(barStyle, backgroundColor, enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return;
      }

      StatusBar.setBarStyle(barStyle, true);
      // Draw app content behind a transparent status bar. Icon contrast still
      // follows barStyle; opaque backgroundColor would cover the surface.
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent');
        setAndroidSystemBars(barStyle === 'light-content');
      }
    }, [barStyle, backgroundColor, enabled]),
  );
}

export function useThemedFocusStatusBar({ inverted = false } = {}) {
  const { isDarkMode, colors, isAnimating } = useTheme();
  const barStyle = inverted
    ? isDarkMode
      ? 'dark-content'
      : 'light-content'
    : isDarkMode
      ? 'light-content'
      : 'dark-content';

  // Skip while the circular reveal runs so Android status-bar chrome
  // doesn't jump ahead of the Skia overlay.
  useFocusStatusBar(barStyle, colors.background, !isAnimating);
}

/**
 * Theme-aware status bar while focused (same as Home / useThemedFocusStatusBar),
 * then restores the inverted account-stack style on blur.
 */
export function useTemporaryFocusStatusBar(focusedStyle, restoredStyle) {
  const { isDarkMode } = useTheme();
  const themedStyle = isDarkMode ? 'light-content' : 'dark-content';
  const invertedStyle = isDarkMode ? 'dark-content' : 'light-content';
  const resolvedFocusedStyle = focusedStyle ?? themedStyle;
  const resolvedRestoredStyle = restoredStyle ?? invertedStyle;

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(resolvedFocusedStyle, true);
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent');
        setAndroidSystemBars(resolvedFocusedStyle === 'light-content');
      }
      return () => {
        StatusBar.setBarStyle(resolvedRestoredStyle, true);
        if (Platform.OS === 'android') {
          setAndroidSystemBars(resolvedRestoredStyle === 'light-content');
        }
      };
    }, [resolvedFocusedStyle, resolvedRestoredStyle]),
  );
}
