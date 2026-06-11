import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '../typography';
import { useThemedStyles } from '../../hooks';
import { useRadioGroup } from './RadioGroupContext';

const OUTER_SIZE = 22;
const INNER_SIZE = 12;

const createStyles = colors =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    radioOuter: {
      width: OUTER_SIZE,
      height: OUTER_SIZE,
      borderWidth: 1.5,
      borderColor: colors.mainBlue,
      borderRadius: OUTER_SIZE / 2,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioInner: {
      width: INNER_SIZE,
      height: INNER_SIZE,
      borderRadius: INNER_SIZE / 2,
      backgroundColor: colors.mainBlue,
      opacity: 1,
    },
    label: {
      flexShrink: 1,
    },
    disabled: {
      opacity: 0.5,
    },
  });

/**
 * @param {{
 *   value?: string | number;
 *   selected?: boolean;
 *   onChange?: (selected: boolean) => void;
 *   label?: React.ReactNode;
 *   disabled?: boolean;
 *   style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 * }} props
 */
export function RadioButton({
  value,
  selected = false,
  onChange,
  label,
  disabled = false,
  style,
}) {
  const styles = useThemedStyles(createStyles);
  const group = useRadioGroup();
  const isSelected = group ? group.value === value : selected;

  const handlePress = () => {
    if (disabled || isSelected) {
      return;
    }

    if (group) {
      group.onChange?.(value);
      return;
    }

    onChange?.(true);
  };

  return (
    <Pressable
      style={[styles.row, disabled && styles.disabled, style]}
      onPress={handlePress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected, disabled }}
    >
      <View style={styles.radioOuter}>
        {isSelected ? <View style={styles.radioInner} /> : null}
      </View>
      {label ? (
        <Typography variant="h6" tone="secondary" style={styles.label}>
          {label}
        </Typography>
      ) : null}
    </Pressable>
  );
}
