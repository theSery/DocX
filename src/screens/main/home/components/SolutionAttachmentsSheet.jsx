import { useCallback, useMemo, useState } from 'react';
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

import { Typography } from '../../../../components';
import AuthButton from '../../../../components/buttons/AuthButton';
import AttachSvg from '../../../../components/icons/AttachSvg';
import CameraSvg from '../../../../components/icons/CameraSvg';
import EyeIconSvg from '../../../../components/icons/EyeIconSvg';
import UploadSvg from '../../../../components/icons/UploadSvg';
import { useTheme, useThemedStyles } from '../../../../hooks';
import { FONT_FAMILY, palette } from '../../../../theme';

/**
 * @typedef {{
 *   key: string;
 *   attachedDocumentId: number | string;
 *   name: string;
 *   isUploaded: boolean;
 *   personalDocument: object | null;
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

/**
 * @param {{
 *   visible: boolean;
 *   attachments: SolutionAttachmentRow[];
 *   onClose: () => void;
 *   onPickFromGallery: (row: SolutionAttachmentRow) => void;
 *   onPickFromFiles: (row: SolutionAttachmentRow) => void;
 *   onConfirm: () => void;
 * }} props
 */
export function SolutionAttachmentsSheet({
  visible,
  attachments,
  onClose,
  onPickFromGallery,
  onPickFromFiles,
  onConfirm,
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const iconColor = colors.icons;
  const allUploaded = attachments.every(item => item.isUploaded);
  const [expandedUploadKey, setExpandedUploadKey] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);

  const previewUrl = previewItem?.personalDocument?.documentUrl ?? null;
  const previewSource = useMemo(
    () => buildFilePreviewSource(previewUrl),
    [previewUrl],
  );
  const previewIsImage = isImageUrl(previewUrl);

  const handleClose = useCallback(() => {
    setExpandedUploadKey(null);
    setPreviewItem(null);
    onClose?.();
  }, [onClose]);

  const handleUploadPress = useCallback(item => {
    setExpandedUploadKey(current =>
      current === item.key ? null : item.key,
    );
  }, []);

  const handleViewPress = useCallback(item => {
    setIsWebViewLoading(true);
    setPreviewItem(item);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewItem(null);
    setIsWebViewLoading(true);
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={previewItem ? handleClosePreview : handleClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={previewItem ? handleClosePreview : handleClose}
      >
        <Pressable style={styles.sheet} onPress={() => {}}>
          {previewItem ? (
            <View style={styles.previewContainer}>
              <View style={styles.previewHeader}>
                <Typography
                  variant="h4"
                  style={styles.previewTitle}
                  numberOfLines={2}
                >
                  {previewItem.name}
                </Typography>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Փակել"
                  onPress={handleClosePreview}
                  style={({ pressed }) => [
                    styles.previewCloseButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                >
                  <Typography variant="h6" style={styles.previewCloseText}>
                    Փակել
                  </Typography>
                </Pressable>
              </View>

              <View style={styles.previewBody}>
                {previewSource ? (
                  previewIsImage ? (
                    <Image
                      source={previewSource}
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <WebView
                      originWhitelist={['*']}
                      source={previewSource}
                      style={styles.previewWebview}
                      scalesPageToFit
                      scrollEnabled
                      showsVerticalScrollIndicator={false}
                      onLoadStart={() => setIsWebViewLoading(true)}
                      onLoadEnd={() => setIsWebViewLoading(false)}
                    />
                  )
                ) : (
                  <View style={styles.previewEmpty}>
                    <Typography variant="h5" tone="secondary">
                      Ֆայլի հղում չի գտնվել
                    </Typography>
                  </View>
                )}

                {previewSource && !previewIsImage && isWebViewLoading ? (
                  <View style={styles.previewLoading}>
                    <Typography variant="h6" tone="secondary">
                      Բեռնվում է...
                    </Typography>
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <>
              <Typography variant="h3" style={styles.title}>
              Բողոքին կից փաստաթղթեր
              </Typography>
              <Typography variant="h6" tone="secondary" style={styles.subtitle}>
              Խնդրում ենք կցել բողոքարկման համար անհրաժեշտ փաստաթղթերը նախքան ուղարկելը
              </Typography>

              <ScrollView
                bounces={false}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              >
                {attachments.map(item => {
                  const isExpanded =
                    !item.isUploaded && expandedUploadKey === item.key;

                  return (
                    <View key={item.key} style={styles.row}>
                      <View style={styles.rowHeader}>
                        <Typography
                          variant="h5"
                          style={styles.rowTitle}
                          numberOfLines={2}
                        >
                          {item.name}
                        </Typography>

                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={
                            item.isUploaded ? 'Դիտել ֆայլը' : 'Կցել ֆայլ'
                          }
                          onPress={() =>
                            item.isUploaded
                              ? handleViewPress(item)
                              : handleUploadPress(item)
                          }
                          style={({ pressed }) => [
                            styles.actionButton,
                            pressed && styles.actionButtonPressed,
                            isExpanded && styles.actionButtonActive,
                          ]}
                        >
                          {item.isUploaded ? (
                            <EyeIconSvg
                              width={22}
                              height={22}
                              fill={colors.icons}
                              visible
                            />
                          ) : (
                            <UploadSvg
                              width={22}
                              height={22}
                              fill={colors.icons}
                            />
                          )}
                        </Pressable>
                      </View>

                      {isExpanded ? (
                        <View style={styles.sourceRow}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Գալերեա"
                            onPress={() => onPickFromGallery?.(item)}
                            style={({ pressed }) => [
                              styles.sourceButton,
                              pressed && styles.sourceButtonPressed,
                            ]}
                          >
                            <CameraSvg
                              width={18}
                              height={18}
                              fill={iconColor}
                            />
                            <Typography
                              variant="h6"
                              style={styles.sourceButtonText}
                            >
                              Գալերեա
                            </Typography>
                          </Pressable>

                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Ֆայլեր"
                            onPress={() => onPickFromFiles?.(item)}
                            style={({ pressed }) => [
                              styles.sourceButton,
                              pressed && styles.sourceButtonPressed,
                            ]}
                          >
                            <AttachSvg
                              width={18}
                              height={18}
                              fill={iconColor}
                            />
                            <Typography
                              variant="h6"
                              style={styles.sourceButtonText}
                            >
                              Ֆայլեր
                            </Typography>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </ScrollView>

              <AuthButton
                title="Կցել ֆայլերը"
                onPress={onConfirm}
                disabled={!allUploaded}
                style={styles.confirmButton}
              />
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 32,
      maxHeight: '80%',
      minHeight: '45%',
    },
    title: {
      textAlign: 'left',
      marginBottom: 6,
      fontSize: 18,
      lineHeight: 24,
    },
    subtitle: {
      marginBottom: 16,
    },
    list: {
      flexGrow: 0,
    },
    listContent: {
      paddingBottom: 8,
      gap: 10,
    },
    row: {
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.background,
      paddingVertical: 14,
      paddingHorizontal: 14,
      gap: 12,
    },
    rowHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
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
    sourceButtonText: {
      fontFamily: FONT_FAMILY.regular,
      color: colors.icons,
    },
    confirmButton: {
      marginTop: 16,
    },
    previewContainer: {
      flexGrow: 1,
      minHeight: 360,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
    },
    previewTitle: {
      flex: 1,
      lineHeight: 22,
    },
    previewCloseButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
    },
    previewCloseText: {
      color: colors.icons,
    },
    previewBody: {
      flex: 1,
      minHeight: 280,
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
    previewLoading: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.72)',
    },
  });
