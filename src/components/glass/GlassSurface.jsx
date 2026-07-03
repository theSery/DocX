import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';

import { useTheme } from '../../hooks';
import { palette } from '../../theme';
import { GLASS } from './glassConfig';
import { GlassSheen } from './GlassSheen';

export function GlassSurface({
  style,
  children,
  gradientId = 'glassSheen',
  borderRadius,
  onLayout,
}) {
  const { isDarkMode } = useTheme();
  const glass = isDarkMode ? GLASS.dark : GLASS.light;
  const blurType = isDarkMode ? 'dark' : 'light';

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.container,
        borderRadius != null && { borderRadius },
        { borderColor: glass.border },
        style,
      ]}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType={blurType}
        blurAmount={glass.blurAmount}
        reducedTransparencyFallbackColor={glass.fallback}
        {...(Platform.OS === 'android' && {
          overlayColor: glass.overlayColor,
        })}
      />
      <View
        pointerEvents="none"
        style={[styles.glassTint, { backgroundColor: glass.tint }]}
      />
      <GlassSheen stops={glass.sheen} gradientId={gradientId} />
      <View
        pointerEvents="none"
        style={[styles.glassRim, { backgroundColor: glass.rim }]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 16,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
  },
  glassRim: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: StyleSheet.hairlineWidth,
    borderRadius: 1,
    opacity: 0.85,
  },
});
