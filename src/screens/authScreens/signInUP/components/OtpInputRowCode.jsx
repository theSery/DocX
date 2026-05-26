import { StyleSheet, TextInput, View } from 'react-native';

import { FONT_FAMILY, palette } from '../../../../theme';
import { useRef } from 'react';

const OTP_LENGTH = 6;
const OTP_BOX_SIZE = 48;
const OTP_BORDER_COLOR = '#B8C4D9';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(\+374\d{8})$/;

const LOGIN_TITLES = {
    mail: 'ՄՈՒՏՔ ԷԼ-ՓՈՍՏՈՎ',
    phone: 'ՄՈՒՏՔ ՀԵՌԱԽՈՍԱՀԱՄԱՐՈՎ',
    phoneOtp: 'ՀԵՌԱԽՈՍԱՀԱՄԱՐԻ ՀԱՍՏԱՏՈՒՄ',
};
// const SCREEN_HEIGHT = Dimensions.get('window').height / 2.2;
const FADE_OUT_MS = 160;
export function OtpInputRowCode({ digits, onChangeDigit, focusedIndex, onFocusIndex }) {
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
                style={[
                    styles.otpBox,
                    isFocused && styles.otpBoxFocused,
                ]}>
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
                    placeholderTextColor={palette.lightGray}
                />
            </View>
        );
    })}
</View>
  );
}
const styles = StyleSheet.create({
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
},
otpBox: {
    width: OTP_BOX_SIZE,
    height: OTP_BOX_SIZE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: OTP_BORDER_COLOR,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
},
otpBoxFocused: {
    borderColor: palette.mainBlue,
    borderWidth: 1.5,
},
otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: FONT_FAMILY.semiBold,
    color: palette.black,
    padding: 0,
},
otpInputPlaceholder: {
    fontFamily: FONT_FAMILY.regular,
    color: palette.lightGray,
},
});