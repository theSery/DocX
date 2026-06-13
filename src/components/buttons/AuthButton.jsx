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
  titleStyle = {},
}) {
  const isDisabled = disabled ?? isLoading;

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
        isLight={false}
        childrenStyle={endIcon ? styles.gradientContentWithEndIcon : undefined}
      >
        {isLoading ? (
          <ActivityIndicator color={palette.white} />
        ) : endIcon ? (
          <View style={styles.buttonContentWithEndIcon}>
            <Typography variant="h5" style={[styles.primaryButtonText, titleStyle]}>
              {title}
            </Typography>
            <View style={styles.endIcon}>{endIcon}</View>
          </View>
        ) : (
          <Typography variant="h5" style={styles.primaryButtonText}>
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
    justifyContent: 'center',
  },
  endIcon: {
    position: 'absolute',
    right: 16,
  },
  primaryButtonText: {
    fontFamily: FONT_FAMILY.regular,
    color: palette.white,
    letterSpacing: 1.2,
  },
});
