import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  buildPdfHtmlDocument,
  FAKE_HTML,
  getPdfWebViewBaseUrl,
} from '../../documents';
import { useThemedStyles } from '../../hooks';
import { Typography } from '../typography';
import { HEIGHT } from '../../utils/dimensions';

/**
 * @param {{
 *   filePath?: string | null;
 *   base64?: string | null;
 *   previewHtml?: string | null;
 *   isLoading?: boolean;
 *   error?: string | null;
 * }} props
 */
export function DocumentPdfPreview({
  filePath,
  previewHtml,
  error,
}) {
  const styles = useThemedStyles(createStyles);

  const previewKey = useMemo(
    () => `${previewHtml?.length ?? 0}:${filePath ?? ''}`,
    [previewHtml, filePath],
  );

  const documentHtmlSource = useMemo(
    () => ({
      html: buildPdfHtmlDocument(FAKE_HTML),
      baseUrl: getPdfWebViewBaseUrl(),
    }),
    [],
  );

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Typography variant="h6" tone="error" style={styles.message}>
          {error}
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        key={`html-${previewKey}`}
        originWhitelist={['*']}
        source={documentHtmlSource}
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
    containerBlank: {
      flex: 1,
      backgroundColor: '#9DA6BA',
      paddingHorizontal: 20,
      height: HEIGHT * 0.3,
    },
    webviewBlank: {
      // flex: 1,
      backgroundColor: '#FFFFFF',
      padding: 20,
     marginTop: 40,
     marginBottom: 70,
     opacity: 0.3,
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
