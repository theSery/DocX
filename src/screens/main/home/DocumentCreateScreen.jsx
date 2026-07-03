import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  buildFilledTemplateBodyHtml,
  buildFilledTemplateDocumentHtml,
  buildTypingAnimationHtml,
  DEFAULT_TYPING_DURATION,
  fetchSignatureImageDataUri,
  generateAndShareDocumentPdf,
  getPdfWebViewBaseUrl,
} from '../../../documents';
import { Typography } from '../../../components';
import { useAppSelector } from '../../../store';
import { selectDocumentFill } from '../../../store/slices/documentFillSlice';
import { selectPersonalData } from '../../../store/slices/personalDataSlice';
import { useGlobalStyles, useThemedStyles } from '../../../hooks';
import { palette } from '../../../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';
import MainHeader from '../../../components/headers/MainHeader';

const WEBVIEW_HEIGHT = 10000;

export function DocumentCreateScreen({ route, navigation }) {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const personalData = useAppSelector(selectPersonalData);
  const documentFill = useAppSelector(selectDocumentFill);
  const { templateText = '', templateName = 'document' } = route.params ?? {};
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [hasTypingFinished, setHasTypingFinished] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAddingSignature, setIsAddingSignature] = useState(false);
  const [signatureImageSrc, setSignatureImageSrc] = useState(null);

  const documentHtml = useMemo(
    () =>
      buildFilledTemplateDocumentHtml(
        templateText,
        {
          personalData,
          documentFill,
        },
        { signatureImageSrc: signatureImageSrc ?? undefined },
      ),
    [templateText, personalData, documentFill, signatureImageSrc],
  );

  const typingBodyHtml = useMemo(
    () =>
      buildFilledTemplateBodyHtml(templateText, {
        personalData,
        documentFill,
      }),
    [templateText, personalData, documentFill],
  );

  const typingSourceKey = useMemo(
    () => `${templateText}:${JSON.stringify(documentFill)}:${JSON.stringify(personalData)}`,
    [templateText, documentFill, personalData],
  );

  useEffect(() => {
    setHasTypingFinished(false);

    const timer = setTimeout(() => {
      setHasTypingFinished(true);
    }, DEFAULT_TYPING_DURATION);

    return () => clearTimeout(timer);
  }, [typingSourceKey]);

  useEffect(() => {
    if (hasTypingFinished) {
      setIsWebViewLoading(true);
    }
  }, [hasTypingFinished]);

  const previewWebViewSource = useMemo(
    () => ({
      html: hasTypingFinished
        ? documentHtml
        : buildTypingAnimationHtml(typingBodyHtml, DEFAULT_TYPING_DURATION),
      baseUrl: getPdfWebViewBaseUrl(),
    }),
    [hasTypingFinished, documentHtml, typingBodyHtml],
  );

  const handleDownloadPdf = useCallback(async () => {
    setIsDownloading(true);
    try {
      await generateAndShareDocumentPdf({
        documentHtml,
        fileName: `docx_${templateName.replace(/\s+/g, '_')}_${Date.now()}`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to generate the PDF.';
      Alert.alert('PDF error', message);
    } finally {
      setIsDownloading(false);
    }
  }, [documentHtml, templateName]);

  const handleAddSignature = useCallback(async () => {
    setIsAddingSignature(true);
    try {
      const imageSrc = await fetchSignatureImageDataUri();
      setSignatureImageSrc(imageSrc);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load the signature.';
      Alert.alert('Signature error', message);
    } finally {
      setIsAddingSignature(false);
    }
  }, []);

  const isActionDisabled =
    isWebViewLoading || !hasTypingFinished || isDownloading || isAddingSignature;

  return (
    <>
              <MainHeader onPress={() => navigation.goBack()} />
 
    <View style={[styles.screen]}>

      <View style={styles.previewContainer}>
        <WebView
          key={hasTypingFinished ? `final-${documentHtml.length}` : `typing-${typingSourceKey}`}
          originWhitelist={['*']}
          source={previewWebViewSource}
          style={styles.webview}
          scalesPageToFit
          scrollEnabled
          showsVerticalScrollIndicator={false}
          startInLoadingState
          onLoadEnd={() => setIsWebViewLoading(false)}
          onLoadStart={() => setIsWebViewLoading(true)}
          renderLoading={() => (
            <View style={[styles.loadingOverlay, styles.centered]}>
              <ActivityIndicator size="large" color={palette.mainBlue} />
            </View>
          )}
        />
        {isWebViewLoading && !hasTypingFinished ? (
          <View style={[styles.loadingOverlay, styles.centered]}>
            <ActivityIndicator size="large" color={palette.mainBlue} />
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
            <Typography variant="h5">
              Ստորագրել
            </Typography>
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
    </>
  );
}

/** @param {import('../../../theme/palettes').ThemeColors} colors */
function createStyles(colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      // paddingTop: 1,
      paddingBottom: TAB_BAR_BOTTOM_OFFSET + 60,
      paddingHorizontal: 10,
    },
    previewContainer: {
      flex: 1,
      height: WEBVIEW_HEIGHT,
      width: '100%',
      overflow: 'hidden',
      // borderRadius: 12,
      backgroundColor: '#9DA6BA',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: 10,
      marginTop: 16,
    },
    webview: {
      flex: 1,
      backgroundColor: 'white',
      padding: 16,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: colors.surface,
    },
    centered: {
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
