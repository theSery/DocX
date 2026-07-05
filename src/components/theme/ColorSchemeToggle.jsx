import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { FONT_FAMILY, palette, ThemePreference } from '../../theme';

const THEME_OPTIONS = [
  { value: ThemePreference.LIGHT, label: 'Ցերեկային' },
  { value: ThemePreference.DARK, label: 'Գիշերային' },
  { value: ThemePreference.SYSTEM, label: 'Լռելյայն' },
];

function ThemeOptionButton({ label, selected, disabled, onPress }) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionButton,
        selected ? styles.optionButtonSelected : styles.optionButtonIdle,
        pressed && !disabled && styles.optionButtonPressed,
      ]}>
      <Text
        style={[
          styles.optionLabel,
          { color: selected ? palette.mainWhite : colors.text },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ColorSchemeToggle({ style }) {
  const { isAnimating, themePreference, setThemePreference } = useTheme();

  const handleSelect = (preference, event) => {
    if (isAnimating || preference === themePreference) {
      return;
    }

    const { pageX, pageY } = event.nativeEvent;
    setThemePreference(preference, pageX, pageY).catch(() => {});
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.optionRow}>
        {THEME_OPTIONS.map(option => (
          <ThemeOptionButton
            key={option.value}
            disabled={isAnimating}
            label={option.label}
            onPress={event => handleSelect(option.value, event)}
            selected={themePreference === option.value}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.mainWhite,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  optionButtonIdle: {
    backgroundColor: palette.skyBlue,
  },
  optionButtonSelected: {
    backgroundColor: palette.mainBlue,
  },
  optionButtonPressed: {
    opacity: 0.88,
  },
  optionLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 13,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
