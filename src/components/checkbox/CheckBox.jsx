import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Typography } from '../typography';
import { useTheme, useThemedStyles } from '../../hooks';

const BOX_SIZE = 20;

const createStyles = colors =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    box: {
      width: BOX_SIZE,
      height: BOX_SIZE,
      borderWidth: 1.5,
      borderColor: colors.mainBlue,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    boxChecked: {
      backgroundColor: colors.mainBlue,
    },
    label: {
      flexShrink: 1,
    },
    disabled: {
      opacity: 0.5,
    },
  });

function CheckMark({ color }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <Path
        d="M2 6.2L4.8 9L10 3.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * @param {{
 *   checked?: boolean;
 *   onChange?: (checked: boolean) => void;
 *   label?: React.ReactNode;
 *   disabled?: boolean;
 *   style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 * }} props
 */
export function CheckBox({ checked = false, onChange, label, disabled = false, style }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.row, disabled && styles.disabled, style]}
      onPress={() => onChange?.(!checked)}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <CheckMark color={colors.buttonTextOnPrimary} /> : null}
      </View>
      {label ? (
        <Typography variant="h6" tone="secondary" style={styles.label}>
          {label}
        </Typography>
      ) : null}
    </Pressable>
  );
}
