import { StyleSheet } from 'react-native';

export function createMainScreenStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      // paddingTop: 16,
  
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: 24,
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
      borderColor: '#FCA5A5',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 10,
      marginTop: 24,
    },
    primaryButtonText: {
      color: '#FFFFFF',
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
      color: '#DC2626',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
}
