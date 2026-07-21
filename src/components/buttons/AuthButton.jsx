import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Typography } from '../typography';
import GradientButton from './GradientButton';
import { FONT_FAMILY, palette } from '../../theme';
import { useTheme } from '../../hooks';

export default function AuthButton({
  title,
  onPress,
  isLoading = false,
  disabled,
  borderRadius = 16,
  style,
  endIcon,
  startIcon,
  isLight = false,
  titleStyle = {},
}) {
  const { colors, isDarkMode } = useTheme();
  const resolvedIsLight = isDarkMode ? !isLight : isLight;
  const isDisabled = disabled ?? isLoading;
  const hasEndIcon = Boolean(endIcon);
  const hasStartIcon = Boolean(startIcon);
  const contentColor = resolvedIsLight
    ? isDarkMode
      ? palette.black
      : colors.icons
    : colors.buttonTextOnPrimary;
  const loaderColor = contentColor;
  const textStyle = [styles.primaryButtonText, { color: contentColor }, titleStyle];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.primaryButton,
        { borderRadius },
        style,
        isDisabled && styles.primaryButtonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
    >
      <GradientButton
        height={45}
        isLight={resolvedIsLight}
        childrenStyle={hasEndIcon ? styles.gradientContentWithEndIcon : undefined}
      >
        {isLoading ? (
          <ActivityIndicator color={loaderColor} />
        ) : hasStartIcon && !hasEndIcon ? (
          <View style={styles.buttonContentRow}>
            {startIcon}
            <Typography variant="h5" style={textStyle}>
              {title}
            </Typography>
          </View>
        ) : hasEndIcon ? (
          <View style={styles.buttonContentWithEndIcon}>
            <Typography
              variant="h5"
              style={[textStyle, { width: '90%', textAlign: 'center' }]}
            >
              {title}
            </Typography>
            <View style={styles.endIcon}>{endIcon}</View>
          </View>
        ) : (
          <Typography variant="h5" style={textStyle}>
            {title}
          </Typography>
        )}
      </GradientButton>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    height: 45,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  gradientContentWithEndIcon: {
    alignItems: 'stretch',
  },
  buttonContentWithEndIcon: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  endIcon: {
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: FONT_FAMILY.regular,
    letterSpacing: 1.2,
  },
});
