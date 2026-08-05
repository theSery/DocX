import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import UploadSvg from '../../../components/icons/UploadSvg';
import { DocumentLoadingOverlay, Typography } from '../../../components';
import { complaintsApi } from '../../../api';
import { fetchSignatureImageDataUri } from '../../../documents';
import {
  useDocumentLoadingOverlay,
  useFileDownload,
  useTheme,
  useThemedStyles,
} from '../../../hooks';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';
import MainHeader from '../../../components/headers/MainHeader';

function buildPdfPreviewSource(fileUrl) {
  if (!fileUrl) {
    return null;
  }

  if (Platform.OS === 'android') {
    return {
      uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`,
    };
  }

  return { uri: fileUrl };
}

export function DocumentSignScreen({ route, navigation }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { id } = route.params ?? {};
  const [complaint, setComplaint] = useState(null);
  const [isFetchingComplaint, setIsFetchingComplaint] = useState(true);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [isAddingSignature, setIsAddingSignature] = useState(false);
  const { isDownloading, downloadRemoteFile } = useFileDownload();

  useEffect(() => {
    if (!id) {
      setIsFetchingComplaint(false);
      return;
    }

    let cancelled = false;

    async function fetchComplaint() {
      setIsFetchingComplaint(true);

      try {
        const response = await complaintsApi.getComplaint(id);

        if (!cancelled) {
          console.log('[DocumentSign] GET /complaints/' + id, response.data);
          setComplaint(response.data?.data ?? response.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.log('[DocumentSign] GET /complaints/' + id + ' error', error);
        }
      } finally {
        if (!cancelled) {
          setIsFetchingComplaint(false);
        }
      }
    }

    fetchComplaint();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const fileUrl = complaint?.fileUrl ?? '';
  const downloadUrl = complaint?.downloadUrl ?? '';
  const title = complaint?.documentName ?? 'document';

  const previewWebViewSource = useMemo(
    () => buildPdfPreviewSource(fileUrl),
    [fileUrl],
  );

  const isContentLoading =
    isFetchingComplaint || (Boolean(previewWebViewSource) && isWebViewLoading);
  const showLoadingOverlay = useDocumentLoadingOverlay(isContentLoading);

  const handleDownloadPdf = useCallback(() => {
    return downloadRemoteFile({
      url: downloadUrl || fileUrl,
      previewUrl: fileUrl,
      fileName: title,
    });
  }, [downloadRemoteFile, downloadUrl, fileUrl, title]);

  const handleAddSignature = useCallback(async () => {
    setIsAddingSignature(true);
    try {
      await fetchSignatureImageDataUri();
      Alert.alert(
        'Ստորագրություն',
        'Ստորագրությունը ավելացվել է։ Փաստաթուղթը պահպանելու համար ներբեռնեք PDF-ը։',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load the signature.';
      Alert.alert('Signature error', message);
    } finally {
      setIsAddingSignature(false);
    }
  }, []);

  const isActionDisabled =
    showLoadingOverlay || isDownloading || isAddingSignature;

  return (
    <View style={styles.root}>
      <MainHeader onPress={() => navigation.goBack()} />
      <View style={styles.screen}>
        <View style={styles.previewShadow}>
          <View style={styles.previewContainer}>
            {previewWebViewSource ? (
              <WebView
                originWhitelist={['*']}
                source={previewWebViewSource}
                style={styles.webview}
                scalesPageToFit
                scrollEnabled
                showsVerticalScrollIndicator={false}
                onLoadEnd={() => setIsWebViewLoading(false)}
                onLoadStart={() => setIsWebViewLoading(true)}
              />
            ) : !isFetchingComplaint ? (
              <View style={styles.emptyState}>
                <Typography variant="h5" tone="secondary">
                  Ֆայլի հղում չի գտնվել
                </Typography>
              </View>
            ) : null}
          </View>
        </View>

        {!showLoadingOverlay ? (
          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Download PDF"
              onPress={handleDownloadPdf}
              disabled={isActionDisabled}
              style={styles.topButton}
            >
              <UploadSvg width={25} height={25} fill={colors.icons} />
            </Pressable>
          </View>
        ) : null}
      </View>

      <DocumentLoadingOverlay visible={showLoadingOverlay} />
    </View>
  );
}

/** @param {import('../../../theme/palettes').ThemeColors} colors */
function createStyles(colors) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    screen: {
      flex: 1,
      paddingBottom: TAB_BAR_BOTTOM_OFFSET ,
      paddingHorizontal: 10,
    },
    previewShadow: {
      flex: 1,
      width: '100%',
      marginTop: 16,
      borderRadius: 8,
      backgroundColor: colors.background,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
    previewContainer: {
      flex: 1,
      overflow: 'hidden',
      borderRadius: 8,
      backgroundColor: '#9DA6BA',
      borderWidth: 1,
      borderColor: colors.border,
    },
    webview: {
      flex: 1,
      backgroundColor: 'white',
      padding: 16,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionRow: {
      gap: 12,
      position: 'absolute',
      right: 20,
      top: 20,
    },
    topButton: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 0,
      opacity: 0.8,
    },
  });
}
