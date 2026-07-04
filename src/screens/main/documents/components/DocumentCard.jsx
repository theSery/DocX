import { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AnimatedView, Typography } from '../../../../components';
import { showGlobalSheet } from '../../../../components/GlobalSheet';
import AttachSvg from '../../../../components/icons/AttachSvg';
import DotsVerticalSvg from '../../../../components/icons/DotsVerticalSvg';
import DownloadSvg from '../../../../components/icons/DownloadSvg';
import MailIconSvg from '../../../../components/icons/MailIconSvg';
import SendSvg from '../../../../components/icons/SendSvg';
import SignatureSvg from '../../../../components/icons/SignatureSvg';
import StarOutlineSvg from '../../../../components/icons/StarOutlineSvg';
import TrashSvg from '../../../../components/icons/TrashSvg';
import { complaintsApi } from '../../../../api';
import { downloadAndShareRemotePdf } from '../../../../documents';
import { FONT_FAMILY } from '../../../../theme';
import { palette } from '../../../../theme/tokens';
import { useThemedStyles, useTheme, useToast } from '../../../../hooks';
import {
  addRecommendedDocument,
  removeRecommendedDocument,
} from '../../../../utils/recommendedDocumentsStorage';

const STATUS_CONFIG = {
  draft: { label: 'Սևագիր', colorKey: 'error' },
  signed: { label: 'Ստորագրված', colorKey: 'success' },
  sent: { label: 'Ուղարկված', colorKey: 'primary' },
};

const CARD_BACKGROUND = '#E8EFFF';

export function DocumentCard({ document, onDeleted, onRecommendedChange }) {
  const navigation = useNavigation();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const status = STATUS_CONFIG[document.status] ?? STATUS_CONFIG.draft;
  const canSend = document.status === 'signed';
  const isRecommended = Boolean(document.recommended);
  const iconColor = colors.mainBlue;
  const disabledIconColor = colors.textDisabled;

  const handleDelete = useCallback(async () => {
    try {
      await complaintsApi.deleteComplaint(document.id);
      await removeRecommendedDocument(document.id);
      onDeleted?.(document.id);
      showToast({
        title: 'Փաստաթուղթը հաջողությամբ ջնջվեց',
        type: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Ջնջելը ձախողվեց',
        body: error?.message ?? 'Անհայտ սխալ, փորձեք կրկին',
        type: 'error',
      });
    }
  }, [document.id, onDeleted, showToast]);

  const handleToggleRecommended = useCallback(async () => {
    try {
      const nextRecommendedIds = isRecommended
        ? await removeRecommendedDocument(document.id)
        : await addRecommendedDocument(document.id);

      onRecommendedChange?.(nextRecommendedIds);
      showToast({
        title: isRecommended
          ? 'Հեռացվեց նախընտրելիից'
          : 'Նշվեց որպես նախընտրելի',
        type: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Գործողությունը ձախողվեց',
        body: error?.message ?? 'Անհայտ սխալ, փորձեք կրկին',
        type: 'error',
      });
    }
  }, [document.id, isRecommended, onRecommendedChange, showToast]);

  const handleSign = useCallback(() => {
    navigation.navigate('DocumentSign', {
      id: document.id,
    });
  }, [document.id, navigation]);

  const handleDownload = useCallback(async () => {
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

  const showDeleteConfirmation = useCallback(() => {
    showGlobalSheet({
      message: 'Դուք համոզված եք, որ ցանկանում եք ջնջել',
      description: `${document.title}\n${document.organization} • ${document.sendDate}`,
      actions: [
        { label: 'Ջնջել', destructive: true, onPress: handleDelete },
        { label: 'Չեղարկել' },
      ],
    });
  }, [document.organization, document.sendDate, document.title, handleDelete]);

  const handleMenuPress = useCallback(() => {
    setIsMenuOpen(true);

    showGlobalSheet({
      variant: 'menu',
      onDismiss: () => setIsMenuOpen(false),
      menuItems: [
        {
          label: 'Ջնջել',
          icon: <TrashSvg width={20} height={20} fill={iconColor} />,
          onPress: showDeleteConfirmation,
        },
        {
          label: 'Ստորագրել',
          icon: <SignatureSvg width={20} height={20} fill={iconColor} />,
          onPress: handleSign,
        },
        {
          label: 'Ներբեռնել',
          icon: <DownloadSvg width={20} height={20} fill={iconColor} />,
          onPress: handleDownload,
        },
        {
          label: isRecommended ? 'Հեռացնել նախընտրելից' : 'Նշել որպես նախընտրելի',
          icon: <StarOutlineSvg width={20} height={20} fill={isRecommended ? disabledIconColor  : iconColor} />,
          onPress: handleToggleRecommended,
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
  }, [
    canSend,
    document.organization,
    handleDownload,
    handleSign,
    handleToggleRecommended,
    iconColor,
    disabledIconColor,
    isRecommended,
    showDeleteConfirmation,
  ]);

  return (
    <AnimatedView
      animation="fadeInLeft"
      animationConfig={{ duration: 600 }}
      style={[styles.cardShadow, isMenuOpen && styles.cardShadowSelected]}
    >
      <View style={[styles.card, isMenuOpen && styles.cardSelected]}>
      <View style={styles.headerRow}>
        <Typography variant="h6" tone="secondary" style={styles.date}>
          {document.sendDate}
        </Typography>
        <View style={styles.headerActions}>
          {isRecommended ? (
            <View style={styles.recommendedIcon}>
              <StarOutlineSvg width={18} height={17} fill={colors.primary} />
            </View>
          ) : null}
          <View style={[styles.statusBadge, { backgroundColor: colors[status.colorKey] }]}>
            <Typography variant="h6" tone="onDark" style={styles.statusText}>
              {status.label}
            </Typography>
          </View>
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
    </AnimatedView>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    cardShadow: {
      marginBottom: 12,
      borderRadius: 24,
      backgroundColor: colors.background,
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
    cardShadowSelected: {
      backgroundColor: CARD_BACKGROUND,
    },
    card: {
      borderRadius: 24,
      backgroundColor: colors.background,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 14,
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
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    recommendedIcon: {
      alignItems: 'center',
      justifyContent: 'center',
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
