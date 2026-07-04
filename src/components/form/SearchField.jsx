import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { FONT_FAMILY } from '../../theme';
import { useTheme, useThemedStyles } from '../../hooks';
import CloseIcon from '../icons/CloseIcon';

const INPUT_RADIUS = 16;

const createStyles = colors =>
  StyleSheet.create({
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 45,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: INPUT_RADIUS,
      backgroundColor: colors.input,
      paddingHorizontal: 16,
      gap: 10,
    },
    inputRowSearch: {
      backgroundColor: colors.pureWhite,
    },
    inputRowSearchFocused: {
      borderColor: colors.iconAccent,
    },
    inputRowDropdownOpen: {
      borderBottomWidth: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    inputRowDropdownClosed: {
      borderBottomWidth: 1,
      borderBottomLeftRadius: INPUT_RADIUS,
      borderBottomRightRadius: INPUT_RADIUS,
    },
    inputIcon: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    endButton: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 3,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 100,

    },
    input: {
      flex: 1,
      height: '100%',
      padding: 0,
      fontSize: 15,
      fontFamily: FONT_FAMILY.regular,
      color: colors.text,
    },
  });

export function SearchField({
  value,
  onChangeText,
  placeholder,
  startIcon,
  onBlur,
  onClear,
  isDropdownOpen = false,
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const showClearButton = isDropdownOpen && Boolean(value);

  return (
    <View
      style={[
        styles.inputRow,
        styles.inputRowSearch,
        isFocused && styles.inputRowSearchFocused,
        isDropdownOpen ? styles.inputRowDropdownOpen : styles.inputRowDropdownClosed,
      ]}
    >
      {startIcon ? <View style={styles.inputIcon}>{startIcon}</View> : null}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {showClearButton ? (
        <Pressable
          onPress={onClear}
          hitSlop={8}
          style={styles.endButton}
          accessibilityRole="button"
          accessibilityLabel="Մաքրել"
        >
          <CloseIcon width={15} height={15} fill={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}
