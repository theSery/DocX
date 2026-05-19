import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../GradientBackground';
import {
  AUTH_SCREEN_CONTENT_PADDING_VERTICAL,
  AUTH_SCREEN_HORIZONTAL_PADDING,
} from './authLayoutConstants';

/**
 * Standard safe-area wrapper for authentication screens.
 * Gradient backgrounds extend edge-to-edge; content respects system insets.
 */
export function AuthScreenLayout({
  children,
  style,
  contentStyle,
  edges = ['top', 'left', 'right'],
  withGradient,
  gradientIsLight,
  gradientHeight,
  animatedGradientHeight,
  // gradientRadius,
}) {
  const safeAreaContent = (
    <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );

  if (withGradient) {
    return (
      <GradientBackground
        isLight={gradientIsLight}
        centered={false}
        gradientHeight={gradientHeight}
        animatedGradientHeight={animatedGradientHeight}>
        {safeAreaContent}
      </GradientBackground>
    );
  }

  return <View style={[styles.root, style]}>{safeAreaContent}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: AUTH_SCREEN_HORIZONTAL_PADDING,
    paddingVertical: AUTH_SCREEN_CONTENT_PADDING_VERTICAL,
  },
});
