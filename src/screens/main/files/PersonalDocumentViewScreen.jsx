import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { DocumentLoadingOverlay, Typography } from '../../../components';
import MainHeader from '../../../components/headers/MainHeader';
import UploadSvg from '../../../components/icons/UploadSvg';
import {
  useDocumentLoadingOverlay,
  useFileDownload,
  useTheme,
  useThemedStyles,
} from '../../../hooks';
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
  const { colors } = useTheme();
  const { title, documentUrl, downloadUrl } = route.params ?? {};
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const { isDownloading, downloadRemoteFile } = useFileDownload();

  const previewWebViewSource = useMemo(
    () => buildFilePreviewSource(documentUrl),
    [documentUrl],
  );

  const showLoadingOverlay = useDocumentLoadingOverlay(
    Boolean(previewWebViewSource) && isWebViewLoading,
  );

  const handleDownload = () =>
    downloadRemoteFile({
      url: downloadUrl,
      previewUrl: documentUrl,
      fileName: title ?? 'document',
    });

  const isActionDisabled = showLoadingOverlay || isDownloading || !downloadUrl;

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
            ) : (
              <View style={styles.emptyState}>
                <Typography variant="h5" tone="secondary">
                  Ֆայլի հղում չի գտնվել
                </Typography>
              </View>
            )}
          </View>
        </View>

        {downloadUrl && !showLoadingOverlay ? (
          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Download file"
              onPress={handleDownload}
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
      paddingBottom: TAB_BAR_BOTTOM_OFFSET,
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
