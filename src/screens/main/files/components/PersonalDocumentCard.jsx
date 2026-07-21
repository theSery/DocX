import { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { StaggeredAnimatedView, Typography } from '../../../../components';
import { showGlobalSheet } from '../../../../components/GlobalSheet';
import AttachSvg from '../../../../components/icons/AttachSvg';
import CameraSvg from '../../../../components/icons/CameraSvg';
import DownloadSvg from '../../../../components/icons/DownloadSvg';
import EyeIconSvg from '../../../../components/icons/EyeIconSvg';
import TrashSvg from '../../../../components/icons/TrashSvg';
import UploadSvg from '../../../../components/icons/UploadSvg';
import WarningSvg from '../../../../components/icons/WarningSvg';
import { FONT_FAMILY } from '../../../../theme';
import DotsVerticalSvg from '../../../../components/icons/DotsVerticalSvg';
import { useThemedStyles, useTheme } from '../../../../hooks';
import { usePersonalDocumentCard } from '../hooks';

export function PersonalDocumentCard({
  document,
  index = 0,
  onDeleted,
  onUploaded,
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const iconColor = colors.icons;

  const {
    isMenuOpen,
    setIsMenuOpen,
    hasDocument,
    hasFile,
    statusLabel,
    statusColorKey,
    handleDownload,
    pickFromGallery,
    pickFromFiles,
    showDeleteConfirmation,
    handleViewFile,
  } = usePersonalDocumentCard({ document, onDeleted, onUploaded });

  const handleUpload = useCallback(() => {
    showGlobalSheet({
      variant: 'menu',
      menuItems: [
        {
          label: 'Գալերեա',
          icon: <CameraSvg width={20} height={20} fill={iconColor} />,
          onPress: pickFromGallery,
        },
        {
          label: 'Ֆայլեր',
          icon: <AttachSvg width={20} height={20} fill={iconColor} />,
          onPress: pickFromFiles,
        },
      ],
    });
  }, [iconColor, pickFromFiles, pickFromGallery]);

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
        ...(hasDocument
          ? [
              {
                label: 'Դիտել ֆայլը',
                icon: (
                  <EyeIconSvg width={20} height={20} fill={iconColor} visible />
                ),
                onPress: handleViewFile,
              },
            ]
          : []),
        ...(hasDocument
          ? [
              {
                label: 'Ներբեռնել',
                icon: (
                  <DownloadSvg
                    width={20}
                    height={20}
                    fill={hasFile ? iconColor : colors.textDisabled}
                  />
                ),
                disabled: !hasFile,
                onPress: handleDownload,
              },
            ]
          : [
              {
                label: 'Վերբեռնել',
                icon: (
                  <UploadSvg width={20} height={20} fill={iconColor} />
                ),
                onPress: handleUpload,
              },
            ]),
      ],
    });
  }, [
    colors.textDisabled,
    handleDownload,
    handleUpload,
    handleViewFile,
    hasDocument,
    hasFile,
    iconColor,
    setIsMenuOpen,
    showDeleteConfirmation,
  ]);

  return (
    <StaggeredAnimatedView
      index={index}
      style={[styles.cardShadow, isMenuOpen && styles.cardShadowSelected]}
    >
      <View style={[styles.card, isMenuOpen && styles.cardSelected]}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: colors[statusColorKey] },
            ]}
          >
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
            <DotsVerticalSvg fill={colors.icons} />
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.attachIcon}>
            {hasDocument ? (
              <View style={styles.attachIcon}>
                <AttachSvg fill={colors.icons} />
              </View>
            ) : (
              <View style={styles.attachIcon}>
                <WarningSvg width={22} height={22} fill={colors.error} />
              </View>
            )}
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.actionButton}
            onPress={hasDocument ? handleDownload : handleUpload}
            disabled={hasDocument && !hasFile}
          >
            {hasDocument ? (
              <View style={styles.actionButtonIcon}>
                <Typography variant="h6" style={styles.actionButtonText}>
                  Ներբեռնել
                </Typography>
                <DownloadSvg width={16} height={16} fill={colors.icons} />
              </View>
            ) : (
              <View style={styles.actionButtonIcon}>
                <Typography variant="h6" style={styles.actionButtonText}>
                  Վերբեռնել
                </Typography>
                <UploadSvg width={16} height={16} fill={colors.icons} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
    cardShadowSelected: {
      backgroundColor: colors.cardSelected,
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
      backgroundColor: colors.cardSelected,
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
    attachIcon: {
      width: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    actionButtonText: {
      fontFamily: FONT_FAMILY.regular,
      fontSize: 14,
      letterSpacing: 0.8,
      color: colors.icons,
    },
    actionButtonIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
  });
