import { Keyboard, Platform, StyleSheet, TextInput, View } from 'react-native';
import { useEffect, useRef } from 'react';

import { FONT_FAMILY } from '../../../../theme';
import { useTheme, useThemedStyles } from '../../../../hooks';

const DEFAULT_OTP_LENGTH = 6;
const OTP_BOX_SIZE = 48;

export function OtpInputRowCode({
  digits,
  onChangeDigit,
  focusedIndex,
  onFocusIndex,
  length = DEFAULT_OTP_LENGTH,
  style,
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const inputRefs = useRef([]);
  const otpLength = digits?.length || length;

  useEffect(() => {
    if (focusedIndex == null) {
      return;
    }
    inputRefs.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  useEffect(() => {
    const isComplete =
      Array.isArray(digits) &&
      digits.length === otpLength &&
      digits.every(Boolean);

    if (!isComplete) {
      return;
    }

    inputRefs.current.forEach(ref => ref?.blur());
    Keyboard.dismiss();
  }, [digits, otpLength]);

  const handleChange = (text, index) => {
    const cleaned = text.replace(/\D/g, '');

    if (cleaned.length > 1) {
      onChangeDigit(index, cleaned);
      const focusTo = Math.min(cleaned.length, otpLength) - 1;
      onFocusIndex(Math.max(0, focusTo));
      return;
    }

    const digit = cleaned.slice(-1);
    onChangeDigit(index, digit);

    if (digit && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
      onFocusIndex(index + 1);
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      onFocusIndex(index - 1);
    }
  };

  return (
    <View style={[styles.otpRow, style]}>
      {digits.map((digit, index) => {
        const isFocused = focusedIndex === index;
        const isEmpty = !digit;

        return (
          <View
            key={index}
            style={[styles.otpBox, isFocused && styles.otpBoxFocused]}
          >
            <TextInput
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                isEmpty && !isFocused && styles.otpInputPlaceholder,
              ]}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={event => handleKeyPress(event, index)}
              onFocus={() => onFocusIndex(index)}
              keyboardType="number-pad"
              // Allow full-code paste / iOS AutoFill into a single box.
              maxLength={otpLength}
              selectTextOnFocus
              caretHidden={isEmpty && !isFocused}
              placeholder={isEmpty && !isFocused ? '—' : ''}
              placeholderTextColor={colors.textDisabled}
              textContentType="oneTimeCode"
              autoComplete={
                Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'
              }
              importantForAutofill="yes"
            />
          </View>
        );
      })}
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    otpRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    otpBox: {
      width: OTP_BOX_SIZE,
      height: OTP_BOX_SIZE,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    otpBoxFocused: {
      borderColor: colors.icons,
      borderWidth: 1.5,
    },
    otpInput: {
      width: '100%',
      height: '100%',
      textAlign: 'center',
      fontSize: 20,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.text,
      padding: 0,
    },
    otpInputPlaceholder: {
      fontFamily: FONT_FAMILY.regular,
      color: colors.textDisabled,
    },
  });
