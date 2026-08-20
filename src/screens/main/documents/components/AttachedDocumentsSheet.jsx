import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import AttachSvg from '../../../../components/icons/AttachSvg';
import CloseSvg from '../../../../components/icons/CloseSvg';
import EyeIconSvg from '../../../../components/icons/EyeIconSvg';
import { useTheme, useThemedStyles } from '../../../../hooks';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  fetchPersonalDocuments,
  selectPersonalDocuments,
  selectPersonalDocumentsStatus,
} from '../../../../store/slices/personalDocumentsSlice';
import { FONT_FAMILY, palette } from '../../../../theme';
import { mapPersonalDocumentToFile } from '../../files/utils/mapPersonalDocumentToFile';

const PREVIEW_LOAD_TIMEOUT_MS = 8000;

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

function matchesAttachedIds(doc, attachedIds) {
  if (!attachedIds.size) {
    return false;
  }

  return [doc?.attachedDocumentId, doc?.id, doc?.fileId].some(
    value => value != null && attachedIds.has(String(value)),
  );
}

export function AttachedDocumentsSheet({
  visible,
  attachedDocuments,
  onClose,
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const personalDocuments = useAppSelector(selectPersonalDocuments);
  const status = useAppSelector(selectPersonalDocumentsStatus);

  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const attachedIds = useMemo(
    () => new Set((attachedDocuments ?? []).map(id => String(id))),
    [attachedDocuments],
  );

  const matchedFiles = useMemo(
    () =>
      (personalDocuments ?? [])
        .filter(doc => matchesAttachedIds(doc, attachedIds))
        .map(mapPersonalDocumentToFile),
    [attachedIds, personalDocuments],
  );

  const previewUrl =
    previewFile?.documentUrl || previewFile?.downloadUrl || null;
  const previewSource = useMemo(
    () => buildFilePreviewSource(previewUrl),
    [previewUrl],
  );
  const previewIsImage = isImageUrl(previewUrl);
  const isLoadingFiles = status === 'loading' || status === 'idle';

  useEffect(() => {
    if (!visible) {
      setPreviewFile(null);
      setIsPreviewLoading(false);
      return;
    }

    dispatch(fetchPersonalDocuments({ page: 1, limit: 100 }));
  }, [dispatch, visible]);

  useEffect(() => {
    if (!visible || !previewFile || !previewSource || !isPreviewLoading) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setIsPreviewLoading(false);
    }, PREVIEW_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isPreviewLoading, previewFile, previewSource, visible]);

  const handleClosePreview = useCallback(() => {
    setPreviewFile(null);
    setIsPreviewLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    handleClosePreview();
    onClose?.();
  }, [handleClosePreview, onClose]);

  const handleRequestClose = useCallback(() => {
    if (previewFile) {
      handleClosePreview();
      return;
    }
    handleClose();
  }, [handleClose, handleClosePreview, previewFile]);

  const handleSelectFile = useCallback(file => {
    const nextUrl = file?.documentUrl || file?.downloadUrl || null;
    setIsPreviewLoading(Boolean(nextUrl));
    setPreviewFile(file);
  }, []);

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
              {previewFile
                ? previewFile.title
                : 'Դիտել կցված փաստաթղթերը'}
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
            {previewFile ? (
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
                  <View style={styles.emptyState}>
                    <Typography variant="h5" tone="secondary">
                      Ֆայլի հղում չի գտնվել
                    </Typography>
                  </View>
                )}
                {isPreviewLoading ? (
                  <View style={styles.loaderOverlay} pointerEvents="auto">
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : null}
              </View>
            ) : isLoadingFiles ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : matchedFiles.length === 0 ? (
              <View style={styles.emptyState}>
                <Typography variant="h5" tone="secondary" style={styles.emptyText}>
                  Կցված ֆայլեր չեն գտնվել
                </Typography>
              </View>
            ) : (
              <ScrollView
                bounces={false}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              >
                {matchedFiles.map(file => (
                  <Pressable
                    key={file.id}
                    accessibilityRole="button"
                    accessibilityLabel={file.title}
                    onPress={() => handleSelectFile(file)}
                    style={({ pressed }) => [
                      styles.fileRow,
                      pressed && styles.fileRowPressed,
                    ]}
                  >
                    <View style={styles.fileIcon}>
                      <AttachSvg width={18} height={18} fill={colors.icons} />
                    </View>
                    <Typography
                      variant="h5"
                      style={styles.fileTitle}
                      numberOfLines={2}
                    >
                      {file.title || 'Փաստաթուղթ'}
                    </Typography>
                    <EyeIconSvg
                      width={20}
                      height={20}
                      fill={colors.icons}
                      visible
                    />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: 8,
      gap: 12,
    },
    fileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 14,
      backgroundColor: colors.pureWhite,
      borderWidth: 1.5,
      borderColor: colors.borderSubtle,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
      paddingHorizontal: 12,
      paddingVertical: 14,
    },
    fileRowPressed: {
      opacity: 0.7,
    },
    fileIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
    },
    fileTitle: {
      flex: 1,
      fontFamily: FONT_FAMILY.regular,
      lineHeight: 22,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    emptyText: {
      textAlign: 'center',
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
    loaderOverlay: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.82)',
    },
  });
