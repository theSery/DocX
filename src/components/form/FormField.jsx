import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Typography } from '../typography';
import { FONT_FAMILY } from '../../theme';
import { useTheme, useThemedStyles } from '../../hooks';
import EyeIconSvg from '../icons/EyeIconSvg';
import CloseIcon from '../icons/CloseIcon';

const INPUT_RADIUS = 16;
const ARMENIA_PHONE_PREFIX = '+374 ';
const LOCAL_PHONE_LENGTH = 8;

function extractLocalPhoneDigits(text) {
  const digits = text.replace(/\D/g, '');
  if (digits.startsWith('374')) {
    return digits.slice(3, 3 + LOCAL_PHONE_LENGTH);
  }
  return digits.slice(0, LOCAL_PHONE_LENGTH);
}

function formatLocalPhone(digits) {
  const d = digits.slice(0, LOCAL_PHONE_LENGTH);
  if (!d.length) {
    return '';
  }
  if (d.length <= 2) {
    return d;
  }
  if (d.length <= 5) {
    return `${d.slice(0, 2)} ${d.slice(2)}`;
  }
  return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
}

function toPhoneDisplay(localDigits) {
  const formatted = formatLocalPhone(localDigits);
  return formatted ? `${ARMENIA_PHONE_PREFIX}${formatted}` : ARMENIA_PHONE_PREFIX;
}

function localDigitsFromStoredValue(value) {
  if (!value) {
    return '';
  }
  return value.replace(/^\+374/, '').replace(/\D/g, '').slice(0, LOCAL_PHONE_LENGTH);
}

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
      borderColor: colors.border,
    },
    inputRowSearchFocused: {
      borderColor: colors.iconAccent,
    },
    inputIcon: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    endButton: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 8,
    },
    searchClearButton: {
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
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      fontSize: 12,
      fontFamily: FONT_FAMILY.regular,
      color: colors.error,
      marginTop: -4,
    },
  });

export function FormField({
  isSearch = false,
  control,
  name,
  label,
  placeholder,
  rules,
  secureTextEntry,
  startIcon,
  endButton,
  keyboardType,
  autoCapitalize = 'none',
  labelVariant = 'h6',
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const resolvedKeyboardType =
    keyboardType ??
    (name === 'email' ? 'email-address' : name === 'phone' ? 'phone-pad' : 'default');
  const isPhoneField = name === 'phone';
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const showDefaultEyeToggle = secureTextEntry && endButton == null;
  const isMasked = secureTextEntry && !isSecureVisible;

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        const handlePhoneChange = text => {
          const localDigits = extractLocalPhoneDigits(
            text.startsWith('+374') ? text : `${ARMENIA_PHONE_PREFIX}${text}`,
          );
          onChange(localDigits ? `+374${localDigits}` : '');
        };

        const displayValue = isPhoneField
          ? toPhoneDisplay(localDigitsFromStoredValue(value))
          : value;

        return (
          <View style={{ gap: isSearch ? 0 : 8 }}>
            {label ? <Typography variant={labelVariant}>{label}</Typography> : null}
            <View
              style={[
                styles.inputRow,
                isSearch && styles.inputRowSearch,
                isSearch && isFocused && styles.inputRowSearchFocused,
                error && styles.inputError,
              ]}
            >
              {startIcon ? <View style={styles.inputIcon}>{startIcon}</View> : null}
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={colors.textDisabled}
                value={displayValue}
                onChangeText={isPhoneField ? handlePhoneChange : onChange}
                onFocus={() => isSearch && setIsFocused(true)}
                onBlur={() => {
                  if (isSearch) {
                    setIsFocused(false);
                  }
                  onBlur();
                }}
                autoCapitalize={autoCapitalize}
                autoCorrect={false}
                keyboardType={resolvedKeyboardType}
                secureTextEntry={isMasked}
              />
              {showDefaultEyeToggle ? (
                <Pressable
                  onPress={() => setIsSecureVisible(prev => !prev)}
                  hitSlop={8}
                  style={styles.endButton}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isSecureVisible ? 'Թաքցնել գաղտնաբառը' : 'Ցույց տալ գաղտնաբառը'
                  }
                >
                  <EyeIconSvg
                    width={20}
                    height={20}
                    fill={colors.textSecondary}
                    visible={isSecureVisible}
                  />
                </Pressable>
              ) : endButton ? (
                <View style={styles.endButton}>{endButton}</View>
              ) : isSearch && Boolean(value) ? (
                <Pressable
                  onPress={() => onChange('')}
                  hitSlop={8}
                  style={styles.searchClearButton}
                  accessibilityRole="button"
                  accessibilityLabel="Մաքրել"
                >
                  <CloseIcon width={15} height={15} fill={colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>
            {error?.message ? (
              <Text style={styles.errorText}>{error.message}</Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}
