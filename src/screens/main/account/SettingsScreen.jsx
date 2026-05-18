import { Pressable, ScrollView, Text } from 'react-native';
import { ColorSchemeToggle } from '../../../components/theme';
import { useMainScreenStyles } from '../../../hooks';
import { useTheme } from '../../../hooks/useTheme';

const APPEARANCE_OPTIONS = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export function SettingsScreen() {
  const styles = useMainScreenStyles();
  const { colorScheme, colors, isAnimating, toggle } = useTheme();

  const handleSelectScheme = (targetScheme, event) => {
    if (isAnimating || colorScheme === targetScheme) {
      return;
    }
    const { pageX, pageY } = event.nativeEvent;
    toggle(pageX, pageY).catch(() => {});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>App preferences</Text>

      <Text style={styles.sectionTitle}>Appearance</Text>
      <ColorSchemeToggle
        label="Theme"
        description="Tap to switch between light and dark with a smooth transition."
        style={{ marginBottom: 16 }}
      />

      {APPEARANCE_OPTIONS.map(option => {
        const isSelected = colorScheme === option.id;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={event => handleSelectScheme(option.id, event)}
            style={[
              styles.appearanceOption,
              {
                borderColor: isSelected ? colors.primary : colors.border,
                backgroundColor: isSelected ? colors.input : colors.surface,
              },
            ]}>
            <Text style={[styles.appearanceOptionText, { color: colors.text }]}>
              {option.label}
            </Text>
            <Text style={[styles.appearanceOptionHint, { color: colors.textSecondary }]}>
              {isSelected ? 'Selected' : 'Tap to apply'}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
