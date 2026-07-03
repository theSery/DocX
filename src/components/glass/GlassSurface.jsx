import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';

import { useTheme } from '../../hooks';
import { palette } from '../../theme';
import { BLUE_GLASS_BUTTON, GLASS } from './glassConfig';
import { BlueGlassFill } from './BlueGlassFill';
import { GlassSheen } from './GlassSheen';

export function GlassSurface({
  style,
  children,
  gradientId = 'glassSheen',
  borderRadius,
  onLayout,
  showBlur = true,
  showTint = true,
  variant = 'default',
  blueColor,
}) {
  const { isDarkMode } = useTheme();
  const isBlue = variant === 'blue';
  const glass = isBlue ? BLUE_GLASS_BUTTON : isDarkMode ? GLASS.dark : GLASS.light;
  const blurType = isDarkMode ? 'dark' : 'light';
  const shouldBlur = showBlur && !isBlue;
  const shouldTint = showTint && !isBlue;

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.container,
        borderRadius != null && { borderRadius },
        { borderColor: glass.border },
        style,
      ]}>
      {shouldBlur ? (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={blurType}
          blurAmount={glass.blurAmount}
          reducedTransparencyFallbackColor={glass.fallback}
          {...(Platform.OS === 'android' && {
            overlayColor: glass.overlayColor,
          })}
        />
      ) : null}
      {shouldTint ? (
        <View
          pointerEvents="none"
          style={[styles.glassTint, { backgroundColor: glass.tint }]}
        />
      ) : null}
      {isBlue ? (
        <BlueGlassFill gradientId={`${gradientId}Fill`} blueColor={blueColor} />
      ) : null}
      <GlassSheen
        stops={glass.sheen}
        gradientId={gradientId}
        direction={isBlue ? 'diagonal' : 'vertical'}
      />
      {isBlue && glass.vignette && !blueColor ? (
        <GlassSheen
          stops={glass.vignette}
          gradientId={`${gradientId}Vignette`}
          direction="diagonal"
        />
      ) : null}
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
    ...StyleSheet.absoluteFill,
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
