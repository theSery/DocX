import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export function ColorSchemeToggle({ label, description, style }) {
  const { colorScheme, colors, isAnimating, toggle } = useTheme();

  const handlePress = event => {
    if (isAnimating) {
      return;
    }
    const { pageX, pageY } = event.nativeEvent;
    toggle(pageX, pageY).catch(() => {});
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Appearance: ${colorScheme} mode. Double tap to switch.`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border, backgroundColor: colors.surface },
        pressed && styles.pressed,
        style,
      ]}>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {description}
          </Text>
        ) : null}
      </View>
      <View style={[styles.badge, { backgroundColor: colors.input }]}>
        <Text style={[styles.badgeText, { color: colors.text }]}>
          {colorScheme === 'light' ? 'Light' : 'Dark'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.85,
  },
  copy: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
