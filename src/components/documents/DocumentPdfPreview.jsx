import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { toPdfPreviewUri } from '../../documents/createDocumentPdf';
import {
  buildTypingPreviewHtml,
  getPdfWebViewBaseUrl,
} from '../../documents';
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
 *   previewHtml?: string | null;
 *   isLoading?: boolean;
 *   error?: string | null;
 * }} props
 */
export function DocumentPdfPreview({
  filePath,
  base64,
  previewHtml,
  isLoading,
  error,
}) {
  const styles = useThemedStyles(createStyles);
  const pdfSource = useMemo(
    () => getWebViewPdfSource(filePath, base64),
    [filePath, base64],
  );

  const previewKey = useMemo(
    () => `${previewHtml?.length ?? 0}:${filePath ?? ''}`,
    [previewHtml, filePath],
  );

  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    setTypingComplete(false);
  }, [previewKey]);

  const showPdf =
    Boolean(pdfSource) && (!previewHtml || typingComplete);

  const typingHtmlSource = useMemo(() => {
    if (!previewHtml) {
      return null;
    }
    return {
      html: buildTypingPreviewHtml(previewHtml),
      baseUrl: getPdfWebViewBaseUrl(),
    };
  }, [previewHtml]);

  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'TYPING_COMPLETE') {
        setTypingComplete(true);
      }
    } catch {
      // Ignore non-JSON messages from the WebView.
    }
  }, []);

  if (isLoading && !previewHtml) {
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

  if (!showPdf && !typingHtmlSource) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Typography variant="h6" tone="secondary" style={styles.message}>
          Generate a PDF to preview it here.
        </Typography>
      </View>
    );
  }

  const { uri, allowingReadAccessToURL } = pdfSource ?? {};

  return (
    <View style={styles.container}>
      
      {typingHtmlSource && !showPdf ? (
        <View style={styles.containerBlank}>
        <WebView
          key={`typing-${previewKey}`}
          originWhitelist={['*']}
          source={typingHtmlSource}
          style={styles.webviewBlank}
          scalesPageToFit
          onMessage={handleWebViewMessage}
          startInLoadingState
          // renderLoading={() => (
          //   <View style={[styles.container, styles.centered]}>
          //     <ActivityIndicator size="large" />
          //   </View>
          // )}
        />
        </View>
      ) : null}

      {showPdf && uri ? (
        <WebView
          key={`pdf-${previewKey}`}
          originWhitelist={['*']}
          source={{ uri }}
          allowingReadAccessToURL={allowingReadAccessToURL}
          style={styles.webview}
          scalesPageToFit
          startInLoadingState
          // renderLoading={() => (
          //   <View style={[styles.container, styles.centered]}>
          //     <ActivityIndicator size="large" />
          //   </View>
          // )}
        />
      ) : null}
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
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    webviewBlank: {
      flex: 1,
      backgroundColor: '#FFFFFF',
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
