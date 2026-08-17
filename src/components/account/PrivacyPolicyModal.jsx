import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import CloseSvg from '../icons/CloseSvg';
import { Typography } from '../typography';
import { useTheme, useThemedStyles } from '../../hooks';

function getLegalDocumentPayload(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function buildLegalDocumentHtml(content, colors) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: ${colors.surface};
        color: ${colors.text};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 15px;
        line-height: 1.55;
      }
      p { margin: 0 0 12px; }
      a { color: ${colors.icons}; }
    </style>
  </head>
  <body>${content || ''}</body>
</html>`;
}

export function LegalDocumentContent({ title, fetchDocument, logKey }) {
  const styles = useThemedStyles(createContentStyles);
  const { colors } = useTheme();
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(fetchDocument));

  useEffect(() => {
    if (!fetchDocument) {
      return undefined;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setContent('');

    (async () => {
      try {
        const response = await fetchDocument();
        const payload = getLegalDocumentPayload(response);
        if (cancelled) {
          return;
        }

        console.log(`${logKey} response`, payload);
        setContent(payload?.content ?? '');
      } catch (fetchError) {
        if (!cancelled) {
          console.log(`${logKey} error`, fetchError);
          setError(fetchError?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchDocument, logKey]);

  const html = useMemo(
    () => buildLegalDocumentHtml(content, colors),
    [colors, content],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.icons} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Typography variant="h5" tone="secondary" style={styles.message}>
          {error}
        </Typography>
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.section}>
        <Typography variant="h5" tone="secondary">
          {title}
        </Typography>
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      style={styles.webView}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
    />
  );
}

export function PrivacyPolicyModal({ visible, onClose, title, fetchDocument, logKey }) {
  const styles = useThemedStyles(createModalStyles);
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Typography variant="h4" style={styles.title}>
              {title}
            </Typography>
            <Pressable
              onPress={onClose}
              style={styles.closeIconButton}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <CloseSvg width={18} height={18} fill={colors.icons} />
            </Pressable>
          </View>

          <View style={styles.body}>
            {visible ? (
              <LegalDocumentContent
                title={title}
                fetchDocument={fetchDocument}
                logKey={logKey}
              />
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createContentStyles = () =>
  StyleSheet.create({
    webView: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    message: {
      textAlign: 'center',
    },
    section: {
      width: '100%',
    },
  });

const createModalStyles = colors =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      paddingHorizontal: 6,
    },
    card: {
      width: '90%',
      height: '80%',
      backgroundColor: colors.surface,
      borderRadius: 24,
      paddingHorizontal: 20,
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
  });
