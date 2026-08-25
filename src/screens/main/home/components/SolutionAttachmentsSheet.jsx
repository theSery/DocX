import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { Accordion, Typography } from '../../../../components';
import LottieAnimation from '../../../../components/animation/LottieAnimation';
import AuthButton from '../../../../components/buttons/AuthButton';
import AttachSvg from '../../../../components/icons/AttachSvg';
import CameraSvg from '../../../../components/icons/CameraSvg';
import CloseSvg from '../../../../components/icons/CloseSvg';
import EyeIconSvg from '../../../../components/icons/EyeIconSvg';
import TrashSvg from '../../../../components/icons/TrashSvg';
import WarningSvg from '../../../../components/icons/WarningSvg';
import { useTheme, useThemedStyles } from '../../../../hooks';
import { FONT_FAMILY, palette } from '../../../../theme';

/** Fallback if WebView/Image never fires load end (common on reopen / cache). */
const PREVIEW_LOAD_TIMEOUT_MS = 8000;

/**
 * @typedef {{
 *   key: string;
 *   attachedDocumentId: number | string;
 *   name: string;
 *   isUploaded: boolean;
 *   isDefault?: boolean;
 *   canRemove?: boolean;
 *   personalDocument: object | null;
 *   selectionSource?: string | null;
 * }} SolutionAttachmentRow
 */

function buildFilePreviewSource(fileUrl) {
  if (!fileUrl) {
    return null;
  }

  const isPdf = /\.pdf(\?|$)/i.test(fileUrl);

  if (Platform.OS === 'android' && isPdf) {
    return {
      uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`,
    };
  }

  return { uri: fileUrl };
}

function isImageUrl(fileUrl) {
  return /\.(png|jpe?g|gif|webp|bmp)(\?|$)/i.test(String(fileUrl || ''));
}

function attachmentKeyExtractor(item) {
  return item.key;
}

function FileLoadingOverlay({ visible, label }) {
  const styles = useThemedStyles(createLoaderStyles);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.loaderOverlay} pointerEvents="auto">
      <View style={styles.loaderCard}>
        <LottieAnimation
          source={require('../../../../assets/lottie/PDF.json')}
          autoPlay
          loop
          style={styles.loaderLottie}
        />
        <Typography variant="h6" tone="secondary" style={styles.loaderLabel}>
          {label}
        </Typography>
      </View>
    </View>
  );
}

/**
 * @param {{
 *   visible: boolean;
 *   attachments: SolutionAttachmentRow[];
 *   onClose: () => void;
 *   onPickFromGallery: (row: SolutionAttachmentRow) => void;
 *   onPickFromFiles: (row: SolutionAttachmentRow) => void;
 *   onRemoveAttachment?: (row: SolutionAttachmentRow) => void;
 *   onConfirm: () => void;
 *   isConfirming?: boolean;
 *   isUploading?: boolean;
 * }} props
 */
export function SolutionAttachmentsSheet({
  visible,
  attachments,
  onClose,
  onPickFromGallery,
  onPickFromFiles,
  onRemoveAttachment,
  onConfirm,
  isConfirming = false,
  isUploading = false,
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const iconColor = colors.icons;
  const allUploaded = attachments.every(item => item.isUploaded);
  const [previewItem, setPreviewItem] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const previewUrl = previewItem?.personalDocument?.documentUrl ?? null;
  const previewSource = useMemo(
    () => buildFilePreviewSource(previewUrl),
    [previewUrl],
  );
  const previewIsImage = isImageUrl(previewUrl);

  // Only while the sheet is open and something is actually loading.
  const showFileLoader =
    visible &&
    (previewItem
      ? Boolean(previewSource) && isPreviewLoading
      : isUploading);
  const loaderLabel = previewItem
    ? 'Ֆայլը բեռնվում է...'
    : 'Ֆայլը վերբեռնվում է...';

  const resetSheetState = useCallback(() => {
    setPreviewItem(null);
    setIsPreviewLoading(false);
  }, []);

  // Parent may set visible=false without going through handleClose (e.g. after
  // submit). Always clear preview/loader so reopen never shows a stuck overlay.
  useEffect(() => {
    if (!visible) {
      resetSheetState();
    }
  }, [visible, resetSheetState]);

  // WebView/Image can skip onLoadEnd on reopen — clear loader as a fallback.
  useEffect(() => {
    if (!visible || !previewItem || !previewSource || !isPreviewLoading) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setIsPreviewLoading(false);
    }, PREVIEW_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [visible, previewItem, previewSource, isPreviewLoading]);

  const handleClose = useCallback(() => {
    resetSheetState();
    onClose?.();
  }, [onClose, resetSheetState]);

  const handleViewPress = useCallback(item => {
    const nextUrl = item?.personalDocument?.documentUrl ?? null;
    setIsPreviewLoading(Boolean(nextUrl));
    setPreviewItem(item);
  }, []);

  const handleClosePreview = useCallback(() => {
    resetSheetState();
  }, [resetSheetState]);

  const handleRequestClose = useCallback(() => {
    if (previewItem) {
      handleClosePreview();
      return;
    }
    handleClose();
  }, [handleClose, handleClosePreview, previewItem]);

  const handleRemovePress = useCallback(
    item => {
      if (!item?.canRemove) {
        return;
      }
      onRemoveAttachment?.(item);
      if (previewItem?.key === item.key) {
        setPreviewItem(null);
        setIsPreviewLoading(false);
      }
    },
    [onRemoveAttachment, previewItem?.key],
  );

  const renderSourcePicker = useCallback(
    item => (
      <View style={styles.sourceSection}>
        <View style={styles.sourceRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Գալերեա"
            disabled={isUploading}
            onPress={() => onPickFromGallery?.(item)}
            style={({ pressed }) => [
              styles.sourceButton,
              pressed && styles.sourceButtonPressed,
              isUploading && styles.sourceButtonDisabled,
            ]}
          >
            <CameraSvg width={18} height={18} fill={iconColor} />
            <Typography variant="h6" style={styles.sourceButtonText}>
              Գալերեա
            </Typography>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ֆայլեր"
            disabled={isUploading}
            onPress={() => onPickFromFiles?.(item)}
            style={({ pressed }) => [
              styles.sourceButton,
              pressed && styles.sourceButtonPressed,
              isUploading && styles.sourceButtonDisabled,
            ]}
          >
            <AttachSvg width={18} height={18} fill={iconColor} />
            <Typography variant="h6" style={styles.sourceButtonText}>
              Ֆայլեր
            </Typography>
          </Pressable>
        </View>
      </View>
    ),
    [iconColor, isUploading, onPickFromFiles, onPickFromGallery, styles],
  );

  const renderAttachmentHeader = useCallback(
    (item, { isOpen }) => (
      <View style={styles.rowHeader}>
        <Typography variant="h5" style={styles.rowTitle} numberOfLines={2}>
          {item.name}
        </Typography>

        {item.isUploaded ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Դիտել ֆայլը"
            onPress={() => handleViewPress(item)}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <EyeIconSvg
              width={22}
              height={22}
              fill={colors.icons}
              visible
            />
          </Pressable>
        ) : (
          <View
            style={[
              styles.actionButton,
              isOpen && styles.actionButtonActive,
              styles.attachmentItemPending,
            ]}
          >
            <WarningSvg width={22} height={22} fill={colors.error} />
          </View>
        )}
      </View>
    ),
    [colors.error, colors.icons, handleViewPress, styles],
  );

  const renderAttachmentContent = useCallback(
    item => {
      if (item.isUploaded) {
        return (
          <View style={styles.sourceSection}>
            <View style={styles.sourceRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Դիտել ֆայլը"
                onPress={() => handleViewPress(item)}
                style={({ pressed }) => [
                  styles.sourceButton,
                  pressed && styles.sourceButtonPressed,
                ]}
              >
                <EyeIconSvg
                  width={18}
                  height={18}
                  fill={iconColor}
                  visible
                />
                <Typography variant="h6" style={styles.sourceButtonText}>
                  Դիտել ֆայլը
                </Typography>
              </Pressable>

              {item.canRemove ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Հեռացնել ֆայլը"
                  disabled={isUploading}
                  onPress={() => handleRemovePress(item)}
                  style={({ pressed }) => [
                    styles.sourceButton,
                    styles.removeButton,
                    pressed && styles.sourceButtonPressed,
                    isUploading && styles.sourceButtonDisabled,
                  ]}
                >
                  <TrashSvg width={18} height={18} fill={colors.error} />
                  <Typography variant="h6" style={styles.removeButtonText}>
                    Հեռացնել
                  </Typography>
                </Pressable>
              ) : null}
            </View>

            {/* {renderSourcePicker(item)} */}
          </View>
        );
      }

      return renderSourcePicker(item);
    },
    [
      colors.error,
      handleRemovePress,
      handleViewPress,
      iconColor,
      isUploading,
      renderSourcePicker,
      styles,
    ],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleRequestClose}
    >
      <Pressable style={styles.backdrop} onPress={handleRequestClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Typography variant="h4" style={styles.title} numberOfLines={2}>
              {previewItem ? previewItem.name : 'Բողոքին կից փաստաթղթեր'}
            </Typography>
            <Pressable
              onPress={handleRequestClose}
              style={styles.closeIconButton}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <CloseSvg width={18} height={18} fill={colors.icons} />
            </Pressable>
          </View>

          <View style={styles.body}>
            {previewItem ? (
              <View style={styles.previewBody}>
                {previewSource ? (
                  previewIsImage ? (
                    <Image
                      key={`preview-image-${previewUrl}`}
                      source={previewSource}
                      style={styles.previewImage}
                      resizeMode="contain"
                      onLoadStart={() => setIsPreviewLoading(true)}
                      onLoad={() => setIsPreviewLoading(false)}
                      onError={() => setIsPreviewLoading(false)}
                    />
                  ) : (
                    <WebView
                      key={`preview-webview-${previewUrl}`}
                      originWhitelist={['*']}
                      source={previewSource}
                      style={styles.previewWebview}
                      scalesPageToFit
                      scrollEnabled
                      showsVerticalScrollIndicator={false}
                      onLoadStart={() => setIsPreviewLoading(true)}
                      onLoadEnd={() => setIsPreviewLoading(false)}
                      onError={() => setIsPreviewLoading(false)}
                    />
                  )
                ) : (
                  <View style={styles.previewEmpty}>
                    <Typography variant="h5" tone="secondary">
                      Ֆայլի հղում չի գտնվել
                    </Typography>
                  </View>
                )}
              </View>
            ) : (
              <>
                <Typography
                  variant="h6"
                  tone="secondary"
                  style={styles.subtitle}
                >
                  Խնդրում ենք կցել բողոքարկման համար անհրաժեշտ փաստաթղթերը
                  նախքան ուղարկելը
                </Typography>

                <ScrollView
                  bounces={false}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Accordion
                    key={visible ? 'attachments-open' : 'attachments-closed'}
                    items={attachments}
                    keyExtractor={attachmentKeyExtractor}
                    itemStyle={item => [
                      styles.attachmentItem,
                      item.isUploaded
                        ? styles.attachmentItemUploaded
                        : styles.attachmentItemPending,
                    ]}
                    contentStyle={styles.attachmentContent}
                    renderHeader={renderAttachmentHeader}
                    renderContent={renderAttachmentContent}
                  />
                </ScrollView>

                <AuthButton
                  title="Կցել ֆայլերը"
                  onPress={onConfirm}
                  disabled={!allUploaded || isUploading}
                  isLoading={isConfirming}
                  style={styles.confirmButton}
                />
              </>
            )}

            <FileLoadingOverlay visible={showFileLoader} label={loaderLabel} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createLoaderStyles = colors =>
  StyleSheet.create({
    loaderOverlay: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.82)',
      borderRadius: 16,
      zIndex: 2,
    },
    loaderCard: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 20,
      borderRadius: 20,
      backgroundColor: colors.pureWhite,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.14,
      shadowRadius: 12,
      elevation: 8,
    },
    loaderLottie: {
      width: 120,
      height: 120,
    },
    loaderLabel: {
      marginTop: 4,
      textAlign: 'center',
    },
  });

const createStyles = colors =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      paddingHorizontal: 6,
    },
    card: {
      width: '95%',
      height: '80%',
      backgroundColor: colors.surface,
      borderRadius: 24,
      paddingHorizontal: 10,
      paddingTop: 20,
      paddingBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
    },
    title: {
      flex: 1,
      lineHeight: 24,
      textAlign: 'center',
    },
    closeIconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    body: {
      flex: 1,
      minHeight: 0,
    },
    subtitle: {
      marginBottom: 16,
      textAlign: 'center',
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: 8,
    },
    attachmentItem: {
      marginBottom: 12,
      borderRadius: 14,
      backgroundColor: colors.pureWhite,
      borderWidth: 1.5,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
      paddingHorizontal: 8,
      overflow: 'hidden',
    },
    attachmentItemUploaded: {
      borderColor: colors.iconAccent,
    },
    attachmentItemPending: {
      borderColor: colors.dangerBorder,
    },
    attachmentContent: {
      paddingHorizontal: 8,
      paddingTop: 4,
      paddingBottom: 14,
    },
    rowHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 6,
      paddingLeft: 8,
    },
    rowTitle: {
      flex: 1,
      fontFamily: FONT_FAMILY.regular,
      lineHeight: 22,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.buttonTextOnPrimary,
      borderColor: colors.iconAccent,
      borderWidth: 1,
    },
    actionButtonActive: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.icons,
    },
    actionButtonPressed: {
      opacity: 0.7,
    },
    sourceRow: {
      flexDirection: 'row',
      gap: 10,
    },
    sourceSection: {
      gap: 10,
    },
    sourceButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: 42,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
    },
    sourceButtonPressed: {
      opacity: 0.7,
    },
    sourceButtonDisabled: {
      opacity: 0.5,
    },
    sourceButtonText: {
      fontFamily: FONT_FAMILY.regular,
      color: colors.icons,
    },
    removeButton: {
      borderColor: colors.dangerBorder,
    },
    removeButtonText: {
      fontFamily: FONT_FAMILY.regular,
      color: colors.error,
    },
    confirmButton: {
      marginTop: 16,
    },
    previewBody: {
      flex: 1,
      minHeight: 0,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.background,
    },
    previewWebview: {
      flex: 1,
      backgroundColor: palette.pureWhite,
    },
    previewImage: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.background,
    },
    previewEmpty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
  });
