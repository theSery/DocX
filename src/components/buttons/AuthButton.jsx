import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Typography } from '../typography';
import GradientButton from './GradientButton';
import { FONT_FAMILY, palette } from '../../theme';

export default function AuthButton({
  title,
  onPress,
  isLoading = false,
  disabled,
  borderRadius = 10,
  style,
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
      <GradientButton height={45} isLight={false}>
        {isLoading ? (
          <ActivityIndicator color={palette.white} />
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
  primaryButtonText: {
    fontFamily: FONT_FAMILY.regular,
    color: palette.white,
    letterSpacing: 1.2,
  },
});
