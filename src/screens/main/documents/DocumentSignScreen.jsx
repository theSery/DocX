import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { DocumentLoadingOverlay, Typography } from '../../../components';
import { complaintsApi } from '../../../api';
import {
  downloadAndShareRemotePdf,
  fetchSignatureImageDataUri,
} from '../../../documents';
import { useDocumentLoadingOverlay, useThemedStyles } from '../../../hooks';
import { palette } from '../../../theme';
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
  const { id } = route.params ?? {};
  const [complaint, setComplaint] = useState(null);
  const [isFetchingComplaint, setIsFetchingComplaint] = useState(true);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAddingSignature, setIsAddingSignature] = useState(false);

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

  const handleDownloadPdf = useCallback(async () => {
    setIsDownloading(true);
    try {
      await downloadAndShareRemotePdf({
        url: downloadUrl || fileUrl,
        fileName: title,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to download the PDF.';
      Alert.alert('PDF error', message);
    } finally {
      setIsDownloading(false);
    }
  }, [downloadUrl, fileUrl, title]);

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

        <View style={[styles.actionBar, { bottom: TAB_BAR_BOTTOM_OFFSET }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add signature"
            disabled={isActionDisabled}
            onPress={handleAddSignature}
            style={({ pressed }) => [
              styles.actionButton,
              styles.signatureButton,
              pressed && styles.actionButtonPressed,
              isActionDisabled && styles.actionButtonDisabled,
            ]}
          >
            {isAddingSignature ? (
              <ActivityIndicator color={palette.mainBlue} />
            ) : (
              <Typography variant="h5">Ստորագրել</Typography>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Download PDF"
            disabled={isActionDisabled}
            onPress={handleDownloadPdf}
            style={({ pressed }) => [
              styles.actionButton,
              styles.downloadButton,
              pressed && styles.actionButtonPressed,
              isActionDisabled && styles.actionButtonDisabled,
            ]}
          >
            {isDownloading ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <Typography variant="h5" tone="onDark">
                Ներբեռնել PDF
              </Typography>
            )}
          </Pressable>
        </View>
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
      paddingBottom: TAB_BAR_BOTTOM_OFFSET + 60,
      paddingHorizontal: 10,
    },
    previewContainer: {
      flex: 1,
      width: '100%',
      overflow: 'hidden',
      backgroundColor: '#9DA6BA',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: 10,
      marginTop: 16,
    },
    webview: {
      flex: 1,
      backgroundColor: 'white',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionBar: {
      position: 'absolute',
      left: 20,
      right: 20,
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      minHeight: 48,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    signatureButton: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.primary,
    },
    downloadButton: {
      backgroundColor: colors.primary,
    },
    actionButtonPressed: {
      opacity: 0.88,
    },
    actionButtonDisabled: {
      opacity: 0.7,
    },
  });
}
