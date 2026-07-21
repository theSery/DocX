import { StyleSheet } from 'react-native';

/**
 * Unified theme-aware styles for screens and shared layout/text utilities.
 * Pair with local `StyleSheet.create` via `useThemedStyles` for screen-specific layout.
 *
 * @param {import('./palettes').ThemeColors} colors
 */
export function createGlobalStyles(colors) {
  return StyleSheet.create({
    fill: {
      flex: 1,
    },
    screen: {
      flex: 1,
      // backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: 24,
    },
    surface: {
      backgroundColor: colors.surface,
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
    },
    cardShadow: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    text: {
      color: colors.text,
    },
    textOnDark: {
      color: colors.textOnDark,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    textDisabled: {
      color: colors.textDisabled,
    },
    textError: {
      color: colors.error,
    },
    textSuccess: {
      color: colors.success,
    },
    textTag: {
      color: colors.tag,
    },
    textSkyBlue: {
      color: colors.skyBlue,
    },
    border: {
      borderColor: colors.border,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 12,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuItemText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    menuItemChevron: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    appearanceOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 10,
    },
    appearanceOptionText: {
      fontSize: 16,
      fontWeight: '600',
    },
    appearanceOptionHint: {
      fontSize: 13,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 10,
      marginTop: 8,
      marginBottom: 12,
    },
    secondaryButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 10,
      marginBottom: 12,
    },
    dangerButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 10,
      marginTop: 24,
    },
    primaryButtonText: {
      color: colors.buttonTextOnPrimary,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    dangerButtonText: {
      color: colors.dangerText,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
}
