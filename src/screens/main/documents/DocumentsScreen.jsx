import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { DocumentPdfPreview } from '../../../components/documents/DocumentPdfPreview';
import { Typography } from '../../../components';
import {
  buildDocumentPreviewHtml,
  createDocumentPdf,
  FAKE_BACKEND_DOCUMENT_HTML,
  FAKE_DOCUMENT_PLACEHOLDERS,
  FAKE_DOCUMENT_SLOTS,
  generateAndShareDocumentPdf,
} from '../../../documents';
import { useGlobalStyles, useThemedStyles } from '../../../hooks';
import { FONT_FAMILY, palette } from '../../../theme';
import { HEIGHT } from '../../../utils/dimensions';

export function DocumentsScreen() {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [isPdfRendering, setIsPdfRendering] = useState(false);
  const [pdfFilePath, setPdfFilePath] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [previewError, setPreviewError] = useState(null);

  const loadPdfPreview = useCallback(async () => {
    setIsPreviewLoading(true);
    setPreviewError(null);
    setPdfFilePath(null);
    setPdfBase64(null);
    setPreviewHtml(null);

    const documentInput = {
      backendHtml: FAKE_BACKEND_DOCUMENT_HTML,
      placeholders: FAKE_DOCUMENT_PLACEHOLDERS,
      slots: FAKE_DOCUMENT_SLOTS,
    };

    try {
      setPreviewHtml(buildDocumentPreviewHtml(documentInput));
      setIsPreviewLoading(false);

      setIsPdfRendering(true);
      const result = await createDocumentPdf({
        ...documentInput,
        fileName: `boghok_${FAKE_DOCUMENT_PLACEHOLDERS.referenceNumber}`,
        includeBase64: Platform.OS === 'android',
      });
      setPdfFilePath(result.filePath);
      setPdfBase64(
        Platform.OS === 'android' ? (result.base64 ?? null) : null,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to generate the PDF.';
      setPreviewError(message);
      setPdfFilePath(null);
      setPdfBase64(null);
      setPreviewHtml(null);
    } finally {
      setIsPreviewLoading(false);
      setIsPdfRendering(false);
    }
  }, []);

  useEffect(() => {
    loadPdfPreview();
  }, [loadPdfPreview]);

  const handleGeneratePdf = useCallback(async () => {
    setIsGenerating(true);
    try {
      await generateAndShareDocumentPdf({
        backendHtml: FAKE_BACKEND_DOCUMENT_HTML,
        placeholders: FAKE_DOCUMENT_PLACEHOLDERS,
        slots: FAKE_DOCUMENT_SLOTS,
        fileName: `boghok_${FAKE_DOCUMENT_PLACEHOLDERS.referenceNumber}`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to generate the PDF.';
      Alert.alert('PDF error', message);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return (
    <View style={[globalStyles.container, styles.screen]}>


      <View style={styles.pdfContainer}>
        <DocumentPdfPreview
          base64={pdfBase64}
          error={previewError}
          filePath={pdfFilePath}
          isLoading={isPreviewLoading}
          previewHtml={previewHtml}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Generate and download PDF"
        disabled={isGenerating || isPreviewLoading || isPdfRendering}
        onPress={handleGeneratePdf}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          (isGenerating || isPreviewLoading || isPdfRendering) &&
            styles.buttonDisabled,
        ]}
      >
        {isGenerating ? (
          <ActivityIndicator color={palette.white} />
        ) : (
          <Typography variant="h5" tone="onDark">
            Ներբեռնել PDF
          </Typography>
        )}
      </Pressable>
    </View>
  );
}

/** @param {import('../../../theme/palettes').ThemeColors} colors */
function createStyles(colors) {
  return StyleSheet.create({
    screen: {
      paddingTop: 16,
      paddingBottom: 24,
      gap: 12,
    },
    title: {
      fontFamily: FONT_FAMILY.semiBold,
    },
    subtitle: {
      maxWidth: 360,
    },
    pdfContainer: {
      flex: 1,
      minHeight: HEIGHT * 0.5,
      marginTop: 4,
    },
    button: {
      minHeight: 48,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPressed: {
      opacity: 0.88,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
  });
}
