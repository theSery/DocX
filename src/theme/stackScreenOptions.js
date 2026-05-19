/**
 * Default stack header options for React Navigation screens.
 *
 * @param {import('./palettes').ThemeColors} colors
 */
export function createStackScreenOptions(colors) {
  return {
    headerShown: true,
    headerTintColor: colors.primary,
    headerStyle: { backgroundColor: colors.background },
    headerTitleStyle: { color: colors.text, fontWeight: '600' },
    headerShadowVisible: false,
  };
}
