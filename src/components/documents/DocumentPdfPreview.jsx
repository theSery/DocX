import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { toPdfPreviewUri } from '../../documents/createDocumentPdf';
import { useThemedStyles } from '../../hooks';
import { Typography } from '../typography';
import { HEIGHT } from '../../utils/dimensions';

/**
 * iOS WKWebView rejects `data:application/pdf;base64,...` — use a file URL instead.
 * Android may use base64 only when no file path is available.
 *
 * @param {string} filePath
 * @returns {{ uri: string; allowingReadAccessToURL?: string } | null}
 */
function getWebViewPdfSource(filePath, base64) {
  if (filePath) {
    const uri = toPdfPreviewUri(filePath);
    if (Platform.OS === 'ios') {
      const directoryUri = uri.substring(0, uri.lastIndexOf('/') + 1);
      return { uri, allowingReadAccessToURL: directoryUri };
    }
    return { uri };
  }

  if (Platform.OS === 'android' && base64) {
    return { uri: `data:application/pdf;base64,${base64}` };
  }

  return null;
}

/**
 * @param {{
 *   filePath?: string | null;
 *   base64?: string | null;
 *   isLoading?: boolean;
 *   error?: string | null;
 * }} props
 */
export function DocumentPdfPreview({ filePath, base64, isLoading, error }) {
  const styles = useThemedStyles(createStyles);
  const source = getWebViewPdfSource(filePath, base64);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
        <Typography variant="h6" tone="secondary" style={styles.message}>
          PDF is loading…
        </Typography>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Typography variant="h6" tone="error" style={styles.message}>
          {error}
        </Typography>
      </View>
    );
  }

  if (!source) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Typography variant="h6" tone="secondary" style={styles.message}>
          Generate a PDF to preview it here.
        </Typography>
      </View>
    );
  }

  const { uri, allowingReadAccessToURL } = source;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ uri }}
        allowingReadAccessToURL={allowingReadAccessToURL}
        style={styles.webview}
        scalesPageToFit
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.container, styles.centered]}>
            <ActivityIndicator size="large" />
          </View>
        )}
      />
    </View>
  );
}

/** @param {import('../../theme/palettes').ThemeColors} colors */
function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },
    webview: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    message: {
      marginTop: 12,
      textAlign: 'center',
    },
  });
}
