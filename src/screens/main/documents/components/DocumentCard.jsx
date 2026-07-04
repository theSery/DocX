import { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Typography } from '../../../../components';
import { showGlobalSheet } from '../../../../components/GlobalSheet';
import AttachSvg from '../../../../components/icons/AttachSvg';
import DotsVerticalSvg from '../../../../components/icons/DotsVerticalSvg';
import DownloadSvg from '../../../../components/icons/DownloadSvg';
import MailIconSvg from '../../../../components/icons/MailIconSvg';
import PenSvg from '../../../../components/icons/PenSvg';
import SendSvg from '../../../../components/icons/SendSvg';
import SignatureSvg from '../../../../components/icons/SignatureSvg';
import StarOutlineSvg from '../../../../components/icons/StarOutlineSvg';
import TrashSvg from '../../../../components/icons/TrashSvg';
import { FONT_FAMILY } from '../../../../theme';
import { palette } from '../../../../theme/tokens';
import { useThemedStyles, useTheme } from '../../../../hooks';

const STATUS_CONFIG = {
  draft: { label: 'Սևագիր', colorKey: 'error' },
  signed: { label: 'Ստորագրված', colorKey: 'success' },
  sent: { label: 'Ուղարկված', colorKey: 'primary' },
};

const CARD_BACKGROUND = '#E8EFFF';

export function DocumentCard({ document }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const status = STATUS_CONFIG[document.status] ?? STATUS_CONFIG.draft;
  const canSend = document.status === 'signed';
  const iconColor = colors.mainBlue;
  const disabledIconColor = colors.textDisabled;

  const handleMenuPress = useCallback(() => {
    setIsMenuOpen(true);

    showGlobalSheet({
      variant: 'menu',
      onDismiss: () => setIsMenuOpen(false),
      menuItems: [
        {
          label: 'Ջնջել',
          icon: <TrashSvg width={20} height={20} fill={iconColor} />,
        },
        {
          label: 'Խմբագրել',
          icon: <PenSvg width={20} height={20} fill={iconColor} />,
        },
        {
          label: 'Ստորագրել',
          icon: <SignatureSvg width={20} height={20} fill={iconColor} />,
        },
        {
          label: 'Ներբեռնել',
          icon: <DownloadSvg width={20} height={20} fill={iconColor} />,
        },
        {
          label: 'Նշել որպես նախընտրելի',
          icon: <StarOutlineSvg width={20} height={20} fill={iconColor} />,
        },
        {
          label: `Ուղարկել ՀՀ ${document.organization}`,
          icon: (
            <SendSvg width={20} height={20} fill={canSend ? iconColor : disabledIconColor} />
          ),
          disabled: !canSend,
        },
      ],
    });
  }, [canSend, document.organization, iconColor, disabledIconColor]);

  return (
    <View
      style={[styles.card, isMenuOpen && styles.cardSelected]}
    >
      <View style={styles.headerRow}>
        <Typography variant="h6" tone="secondary" style={styles.date}>
          {document.sendDate}
        </Typography>
        <View style={[styles.statusBadge, { backgroundColor: colors[status.colorKey] }]}>
          <Typography variant="h6" tone="onDark" style={styles.statusText}>
            {status.label}
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
        <View style={styles.organizationBadge}>
          <MailIconSvg width={14} height={11} fill={colors.buttonTextOnPrimary} />
          <Typography variant="h6" tone="onDark" style={styles.organizationText} numberOfLines={1}>
            {document.organization}
          </Typography>
        </View>

        {document.hasAttachment ? (
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
      // backgroundColor: CARD_BACKGROUND,
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
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    date: {
      letterSpacing: 0.2,
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
    organizationBadge: {
      flexShrink: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.success,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      maxWidth: '78%',
    },
    organizationText: {
      flexShrink: 1,
      fontFamily: FONT_FAMILY.medium,
      fontSize: 11,
      lineHeight: 14,
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
