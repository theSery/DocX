import { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { StaggeredAnimatedView, Typography } from '../../../../components';
import { showGlobalSheet } from '../../../../components/GlobalSheet';
import AttachSvg from '../../../../components/icons/AttachSvg';
import DotsVerticalSvg from '../../../../components/icons/DotsVerticalSvg';
import DownloadSvg from '../../../../components/icons/DownloadSvg';
import MailIconSvg from '../../../../components/icons/MailIconSvg';
import SendSvg from '../../../../components/icons/SendSvg';
import StarOutlineSvg from '../../../../components/icons/StarOutlineSvg';
import TrashSvg from '../../../../components/icons/TrashSvg';
import { complaintsApi } from '../../../../api';
import { FONT_FAMILY } from '../../../../theme';
import { useFileDownload, useThemedStyles, useTheme, useToast } from '../../../../hooks';
import { removeRecommendedDocument } from '../../../../utils/recommendedDocumentsStorage';
import EyeIconSvg from '../../../../components/icons/EyeIconSvg';
import { AttachedDocumentsSheet } from './AttachedDocumentsSheet';
import { SendEmailSheet } from './SendEmailSheet';

const STATUS_CONFIG = {
  draft: { label: 'Սևագիր', colorKey: 'error' },
  signed: { label: 'Ստորագրված', colorKey: 'success' },
  sent: { label: 'Ուղարկված', colorKey: 'primary' },
};

export function DocumentCard({
  document,
  index = 0,
  onDeleted,
  onSent,
}) {
  const navigation = useNavigation();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { downloadRemoteFile } = useFileDownload();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);
  const [isAttachedDocsOpen, setIsAttachedDocsOpen] = useState(false);
  const status = STATUS_CONFIG[document.status] ?? STATUS_CONFIG.draft;
  const isRecommended = Boolean(document.recommended);
  const hasAttachedDocuments =
    document.hasAttachment ||
    (Array.isArray(document.attachedDocuments) &&
      document.attachedDocuments.length > 0);
  const iconColor = colors.icons;

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

  const handleSign = useCallback(() => {
    navigation.navigate('DocumentSign', {
      id: document.id,
    });
  }, [document.id, navigation]);

  const handleDownload = useCallback(() => {
    return downloadRemoteFile({
      url: document.downloadUrl,
      fileName: document.title,
    });
  }, [document.downloadUrl, document.title, downloadRemoteFile]);

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

  const handleOpenSendEmail = useCallback(() => {
    setIsSendEmailOpen(true);
  }, []);

  const handleCloseSendEmail = useCallback(() => {
    setIsSendEmailOpen(false);
  }, []);

  const handleOpenAttachedDocuments = useCallback(() => {
    setIsAttachedDocsOpen(true);
  }, []);

  const handleCloseAttachedDocuments = useCallback(() => {
    setIsAttachedDocsOpen(false);
  }, []);

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
          label: 'Դիտել ֆայլը',
          icon: (
            <EyeIconSvg width={20} height={20} fill={iconColor} visible />
          ),
          onPress: handleSign,
        },
        ...(hasAttachedDocuments
          ? [
              {
                label: 'Դիտել կցված փաստաթղթերը',
                icon: <AttachSvg width={20} height={20} fill={iconColor} />,
                onPress: handleOpenAttachedDocuments,
              },
            ]
          : []),
        {
          label: 'Ներբեռնել',
          icon: <DownloadSvg width={20} height={20} fill={iconColor} />,
          onPress: handleDownload,
        },
        {
          label: `Ուղարկել էլ. հասցեի`,
          icon: (
            <SendSvg width={20} height={20} fill={iconColor} />
          ),
          onPress: handleOpenSendEmail,
        },
      ],
    });
  }, [
    handleDownload,
    handleOpenAttachedDocuments,
    handleOpenSendEmail,
    handleSign,
    hasAttachedDocuments,
    iconColor,
    showDeleteConfirmation,
  ]);

  return (
    <StaggeredAnimatedView
      index={index}
      style={[styles.cardShadow, isMenuOpen && styles.cardShadowSelected]}
    >
      {isSendEmailOpen ? (
        <SendEmailSheet
          visible={isSendEmailOpen}
          documentId={document.id}
          documentTitle={document.title}
          attachedDocuments={document.attachedDocuments}
          onClose={handleCloseSendEmail}
          onSent={onSent}
        />
      ) : null}
      {isAttachedDocsOpen ? (
        <AttachedDocumentsSheet
          visible={isAttachedDocsOpen}
          attachedDocuments={document.attachedDocuments}
          onClose={handleCloseAttachedDocuments}
        />
      ) : null}
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.card, isMenuOpen && styles.cardSelected]}
        onPress={handleMenuPress}
      >
        <View style={styles.headerRow}>
          <Typography variant="h6" tone="secondary" style={styles.date}>
            {document.sendDate}
          </Typography>
          <View style={styles.headerActions}>
            {isRecommended ? (
              <View style={styles.recommendedIcon}>
                <StarOutlineSvg width={18} height={17} fill={colors.icons} />
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
            <DotsVerticalSvg fill={colors.icons} />
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
              <AttachSvg fill={colors.icons} />
            </View>
          ) : (
            <View style={styles.attachPlaceholder} />
          )}
        </View>
      </TouchableOpacity>
    </StaggeredAnimatedView>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    cardShadow: {
      marginBottom: 12,
      borderRadius: 24,
      backgroundColor: colors.background,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
    // shadowColor: colors.shadow,
    // shadowOffset: { width: 0, height: 3 },
    // shadowOpacity: 0.12,
    // shadowRadius: 6,
    // elevation: 4,
    cardShadowSelected: {
      backgroundColor: colors.cardSelected,
    },
    card: {
      borderRadius: 24,
      // backgroundColor: colors.background,
      backgroundColor: colors.pureWhite,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 14,
    },
    cardSelected: {
      backgroundColor: colors.cardSelected,
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
