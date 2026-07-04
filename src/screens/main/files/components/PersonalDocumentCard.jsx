import { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Typography } from '../../../../components';
import { showGlobalSheet } from '../../../../components/GlobalSheet';
import AttachSvg from '../../../../components/icons/AttachSvg';
import DotsVerticalSvg from '../../../../components/icons/DotsVerticalSvg';
import DownloadSvg from '../../../../components/icons/DownloadSvg';
import { downloadAndShareRemotePdf } from '../../../../documents';
import { FONT_FAMILY } from '../../../../theme';
import { palette } from '../../../../theme/tokens';
import { useThemedStyles, useTheme, useToast } from '../../../../hooks';

const CARD_BACKGROUND = '#E8EFFF';

export function PersonalDocumentCard({ document }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const iconColor = colors.mainBlue;
  const hasFile = Boolean(document.downloadUrl);
  const statusLabel = document.isDefault
    ? 'Լռելյայն'
    : document.isUploaded
      ? 'Վերբեռնված'
      : 'Չվերբեռնված';
  const statusColorKey = document.isUploaded || document.isDefault ? 'success' : 'error';

  const handleDownload = useCallback(async () => {
    if (!document.downloadUrl) {
      return;
    }

    try {
      await downloadAndShareRemotePdf({
        url: document.downloadUrl,
        fileName: document.title,
      });
    } catch (error) {
      showToast({
        title: 'Ներբեռնումը ձախողվեց',
        body: error?.message ?? 'Անհայտ սխալ, փորձեք կրկին',
        type: 'error',
      });
    }
  }, [document.downloadUrl, document.title, showToast]);

  const handleMenuPress = useCallback(() => {
    setIsMenuOpen(true);

    showGlobalSheet({
      variant: 'menu',
      onDismiss: () => setIsMenuOpen(false),
      menuItems: [
        {
          label: 'Ներբեռնել',
          icon: <DownloadSvg width={20} height={20} fill={hasFile ? iconColor : colors.textDisabled} />,
          disabled: !hasFile,
          onPress: handleDownload,
        },
      ],
    });
  }, [colors.textDisabled, handleDownload, hasFile, iconColor]);

  return (
    <View style={[styles.card, isMenuOpen && styles.cardSelected]}>
      <View style={styles.headerRow}>
        <View style={[styles.statusBadge, { backgroundColor: colors[statusColorKey] }]}>
          <Typography variant="h6" tone="onDark" style={styles.statusText}>
            {statusLabel}
          </Typography>
        </View>
      </View>

      <View style={styles.titleRow}>
        <Typography variant="h4" style={styles.title} numberOfLines={2}>
          {document.title}
        </Typography>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.menuButton, isMenuOpen && styles.menuButtonActive]}
          onPress={handleMenuPress}
        >
          <DotsVerticalSvg fill={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerPlaceholder} />
        {hasFile ? (
          <View style={styles.attachIcon}>
            <AttachSvg fill={colors.primary} />
          </View>
        ) : (
          <View style={styles.attachPlaceholder} />
        )}
      </View>
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    card: {
      borderRadius: 24,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 14,
      marginBottom: 12,
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    cardSelected: {
      backgroundColor: CARD_BACKGROUND,
      borderColor: colors.primary,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginBottom: 10,
    },
    statusBadge: {
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    statusText: {
      fontFamily: FONT_FAMILY.medium,
      fontSize: 11,
      lineHeight: 14,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 14,
    },
    title: {
      flex: 1,
      letterSpacing: 0.3,
      lineHeight: 22,
    },
    menuButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.buttonTextOnPrimary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    menuButtonActive: {
      backgroundColor: colors.skyBlue,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    footerPlaceholder: {
      flex: 1,
    },
    attachIcon: {
      width: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    attachPlaceholder: {
      width: 24,
    },
  });
