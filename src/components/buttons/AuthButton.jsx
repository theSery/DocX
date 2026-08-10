import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Typography } from '../typography';
import GradientButton from './GradientButton';
import { FONT_FAMILY, palette } from '../../theme';

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
  const isDisabled = disabled ?? isLoading;
  const hasEndIcon = Boolean(endIcon);
  const hasStartIcon = Boolean(startIcon);
  const loaderColor = isLight ? palette.mainBlue : palette.white;
  const textStyle = [
    styles.primaryButtonText,
    isLight && styles.lightButtonText,
    titleStyle,
  ];

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
        isLight={isLight}
        childrenStyle={hasEndIcon ? styles.gradientContentWithEndIcon : undefined}
      >
        {isLoading ? (
          <ActivityIndicator color={loaderColor} />
        ) : hasStartIcon && !hasEndIcon ? (
          title ? (
            <View style={styles.buttonContentRow}>
              {startIcon}
              <Typography variant="h5" style={textStyle}>
                {title}
              </Typography>
            </View>
          ) : (
            startIcon
          )
        ) : hasEndIcon ? (
          <View style={styles.buttonContentWithEndIcon}>
            <Typography variant="h5" style={[textStyle, { width: '90%', textAlign: 'center'}]}>
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
    color: palette.white,
    letterSpacing: 1.2,
  },
  lightButtonText: {
    color: palette.mainBlue,
  },
});
