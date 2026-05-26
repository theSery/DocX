import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { FONT_FAMILY, palette } from '../../../../theme';
import { Typography } from '../../../../components';
import DeleteSvg from '../../../../components/icons/DeleteSvg';

const PASSCODE_LENGTH = 4;

const KEYPAD_ROWS = [
  [
    { type: 'digit', value: '1' },
    { type: 'digit', value: '2' },
    { type: 'digit', value: '3' },
  ],
  [
    { type: 'digit', value: '4' },
    { type: 'digit', value: '5' },
    { type: 'digit', value: '6' },
  ],
  [
    { type: 'digit', value: '7' },
    { type: 'digit', value: '8' },
    { type: 'digit', value: '9' },
  ],
  [
    { type: 'biometric' },
    { type: 'digit', value: '0' },
    { type: 'backspace' },
  ],
];

function FaceIdIcon({ size = 32, color = palette.mainBlue }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M4 11V7a3 3 0 0 1 3-3h4M21 4h4a3 3 0 0 1 3 3v4M28 21v4a3 3 0 0 1-3 3h-4M11 28H7a3 3 0 0 1-3-3v-4"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 13.5v1.5M20 13.5v1.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M16 13v4.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M12.5 21c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}


function PasscodeDots({ filledCount, length }) {
  const dots = useMemo(() => Array.from({ length }), [length]);

  return (
    <View style={styles.dotsRow}>
      {dots.map((_, index) => {
        const isFilled = index < filledCount;
        return (
          <View
            key={index}
            style={[styles.dot, isFilled ? styles.dotFilled : styles.dotEmpty]}
          />
        );
      })}
    </View>
  );
}

function KeypadButton({ children, onPress, accessibilityLabel }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
      {children}
    </Pressable>
  );
}

export function Passcode({
  value,
  onChange,
  onComplete,
  onBiometric,
  length = PASSCODE_LENGTH,
}) {
  const passcode = useMemo(
    () => (Array.isArray(value) ? value : []),
    [value],
  );

  const handleDigitPress = useCallback(
    digit => {
      if (passcode.length >= length) {
        return;
      }
      const next = [...passcode, digit];
      onChange?.(next);
      if (next.length === length) {
        onComplete?.(next.join(''));
      }
    },
    [passcode, length, onChange, onComplete],
  );

  const handleBackspace = useCallback(() => {
    if (passcode.length === 0) {
      return;
    }
    const next = passcode.slice(0, -1);
    onChange?.(next);
  }, [passcode, onChange]);

  const handleBiometric = useCallback(() => {
    if (onBiometric) {
      onBiometric();
      return;
    }
    console.log('Handle biometrics');
  }, [onBiometric]);

  const renderKey = key => {
    if (key.type === 'digit') {
      return (
        <KeypadButton
          key={`digit-${key.value}`}
          onPress={() => handleDigitPress(key.value)}
          accessibilityLabel={`Digit ${key.value}`}>
          <Typography variant="h1" style={styles.keyDigit}>{key.value}</Typography>
        </KeypadButton>
      );
    }
    if (key.type === 'biometric') {
      return (
        <KeypadButton
          key="biometric"
          onPress={handleBiometric}
          accessibilityLabel="Biometric authentication">
          <FaceIdIcon />
        </KeypadButton>
      );
    }
    return (
      <KeypadButton
        key="backspace"
        onPress={handleBackspace}
        accessibilityLabel="Delete last digit">
        <DeleteSvg width={34} height={34} fill={palette.mainBlue} />
      </KeypadButton>
    );
  };

  return (
    <View style={styles.container}>
      <PasscodeDots filledCount={passcode.length} length={length} />
      <View style={styles.keypad}>
        {KEYPAD_ROWS.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.keypadRow}>
            {row.map(renderKey)}
          </View>
        ))}
      </View>
    </View>
  );
}

const DOT_SIZE = 14;


const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 52,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  dotFilled: {
    backgroundColor: palette.mainBlue,
  },
  dotEmpty: {
    backgroundColor: palette.mainWhite,
    borderWidth: 1,
    borderColor: palette.mainBlue,
  },
  keypad: {
    width: '80%',
    gap: 34,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  key: {
    // flex: 1,
    // aspectRatio: 1.6,
  height: 88,
  width: 88,
    borderRadius: 18,
    // backgroundColor: 'red',
    borderWidth: 1,
    borderColor: palette.skyBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    opacity: 0.6,
  },
  keyDigit: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 32,
    lineHeight: 38,
    // color: palette.mainBlue,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
});

export default Passcode;
