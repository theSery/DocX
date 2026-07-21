import { StyleSheet, TextInput, View } from 'react-native';
import { useRef } from 'react';

import { FONT_FAMILY } from '../../../../theme';
import { useTheme, useThemedStyles } from '../../../../hooks';

const OTP_LENGTH = 6;
const OTP_BOX_SIZE = 48;

export function OtpInputRowCode({
  digits,
  onChangeDigit,
  focusedIndex,
  onFocusIndex,
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const inputRefs = useRef([]);

  const handleChange = (text, index) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    onChangeDigit(index, digit);

    if (digit && index < OTP_LENGTH - 1) {
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
    <View style={styles.otpRow}>
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
              maxLength={1}
              selectTextOnFocus
              caretHidden={isEmpty && !isFocused}
              placeholder={isEmpty && !isFocused ? '—' : ''}
              placeholderTextColor={colors.textDisabled}
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
