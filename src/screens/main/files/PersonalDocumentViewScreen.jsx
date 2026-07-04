import { useCallback, useMemo, useState } from 'react';
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
import MainHeader from '../../../components/headers/MainHeader';
import { downloadAndShareRemotePdf } from '../../../documents';
import { useDocumentLoadingOverlay, useThemedStyles } from '../../../hooks';
import { palette } from '../../../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';

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

export function PersonalDocumentViewScreen({ route, navigation }) {
  const styles = useThemedStyles(createStyles);
  const { title, documentUrl, downloadUrl } = route.params ?? {};
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const previewWebViewSource = useMemo(
    () => buildFilePreviewSource(documentUrl),
    [documentUrl],
  );

  const showLoadingOverlay = useDocumentLoadingOverlay(
    Boolean(previewWebViewSource) && isWebViewLoading,
  );

  const handleDownload = useCallback(async () => {
    if (!downloadUrl) {
      return;
    }

    setIsDownloading(true);
    try {
      await downloadAndShareRemotePdf({
        url: downloadUrl,
        fileName: title ?? 'document',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to download the file.';
      Alert.alert('Ներբեռնման սխալ', message);
    } finally {
      setIsDownloading(false);
    }
  }, [downloadUrl, title]);

  const isActionDisabled = showLoadingOverlay || isDownloading || !downloadUrl;

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
          ) : (
            <View style={styles.emptyState}>
              <Typography variant="h5" tone="secondary">
                Ֆայլի հղում չի գտնվել
              </Typography>
            </View>
          )}
        </View>

        {downloadUrl ? (
          <View style={[styles.actionBar, { bottom: TAB_BAR_BOTTOM_OFFSET }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Download file"
              disabled={isActionDisabled}
              onPress={handleDownload}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
                isActionDisabled && styles.actionButtonDisabled,
              ]}
            >
              {isDownloading ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <Typography variant="h5" tone="onDark">
                  Ներբեռնել
                </Typography>
              )}
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
    },
    actionButton: {
      minHeight: 48,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
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
