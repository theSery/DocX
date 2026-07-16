import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import AuthButton from '../../../components/buttons/AuthButton';
import SignatureSvg from '../../../components/icons/SignatureSvg';
import UploadSvg from '../../../components/icons/UploadSvg';
import { WebView } from 'react-native-webview';
import {
  buildComplaintPayload,
  buildFilledTemplateBodyHtml,
  buildPdfHtmlDocument,
  buildTypingAnimationHtml,
  DEFAULT_TYPING_DURATION,
  fetchSignatureImageDataUri,
  generateAndShareDocumentPdf,
  generateComplaintSerialNumber,
  generateDocumentPdf,
  getPdfWebViewBaseUrl,
  prependSerialNumberToBodyHtml,
} from '../../../documents';
import { complaintsApi } from '../../../api';
import { DocumentLoadingOverlay, Typography } from '../../../components';
import { useAppSelector } from '../../../store';
import { selectDocumentFill } from '../../../store/slices/documentFillSlice';
import { selectPersonalData } from '../../../store/slices/personalDataSlice';
import { useDocumentLoadingOverlay, useThemedStyles, useToast } from '../../../hooks';
import { palette } from '../../../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';
import MainHeader from '../../../components/headers/MainHeader';



export function DocumentCreateScreen({ route, navigation }) {

  const styles = useThemedStyles(createStyles);
  const { showToast } = useToast();
  const personalData = useAppSelector(selectPersonalData);
  const documentFill = useAppSelector(selectDocumentFill);
  const { templateText = '', templateName = 'document', templateId } = route.params ?? {};
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [hasTypingFinished, setHasTypingFinished] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAddingSignature, setIsAddingSignature] = useState(false);
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [signatureImageSrc, setSignatureImageSrc] = useState(null);
  const isContentLoading = !hasTypingFinished || isWebViewLoading;
  const showLoadingOverlay = useDocumentLoadingOverlay(isContentLoading);

  const userId = personalData?.id ?? personalData?.userId;

  const serialNumber = useMemo(
    () => generateComplaintSerialNumber(userId),
    [userId],
  );

  const bodyHtml = useMemo(
    () =>
      buildFilledTemplateBodyHtml(
        templateText,
        { personalData, documentFill },
        { signatureImageSrc: signatureImageSrc ?? undefined },
      ),
    [templateText, personalData, documentFill, signatureImageSrc],
  );

  const bodyHtmlWithSerial = useMemo(
    () => prependSerialNumberToBodyHtml(bodyHtml, serialNumber),
    [bodyHtml, serialNumber],
  );

  const documentHtml = useMemo(
    () => buildPdfHtmlDocument(bodyHtmlWithSerial),
    [bodyHtmlWithSerial],
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
    console.log('handleAddSignature', Date.now());
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

  const handleSubmitComplaint = useCallback(async () => {
    if (!templateId) {
      showToast({
        title: 'Սխալ',
        body: 'Փաստաթղթի ձևանմուշը չի գտնվել։',
        type: 'error',
      });
      return;
    }

    setIsSubmittingComplaint(true);
    try {
      const payload = buildComplaintPayload({
        templateId,
        documentName: templateName,
        bodyHtml: bodyHtmlWithSerial,
        userId,
      });

      const pdf = await generateDocumentPdf({
        documentHtml,
        fileName: `docx_${templateName.replace(/\s+/g, '_')}_${Date.now()}`,
      });

      await complaintsApi.createComplaint({
        ...payload,
        file: {
          uri: pdf.filePath,
          name: payload.documentName,
          type: 'application/pdf',
        },
      });

      showToast({
        title: 'Հաջողություն',
        body: 'Փաստաթուղթը ուղարկված է ՀՀ ՆԳՆ Պարեկային ծառայություն։',
        type: 'success',
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeMain' }],
      });
    } catch (error) {
      console.log(error, 'error');
      const message =
        error?.message ??
        (error instanceof Error
          ? error.message
          : 'Չհաջողվեց ուղարկել փաստաթուղթը։');

      showToast({
        title: 'Սխալ',
        body: message,
        type: 'error',
      });
    } finally {
      setIsSubmittingComplaint(false);
    }
  }, [
    templateId,
    templateName,
    bodyHtmlWithSerial,
    documentHtml,
    userId,
    navigation,
    showToast,
  ]);
console.log(signatureImageSrc, 'signatureImageSrc');
  const isActionDisabled =
    showLoadingOverlay ||
    isDownloading ||
    isAddingSignature ||
    isSubmittingComplaint;

  return (
    <View style={styles.root}>
      <MainHeader onPress={() => navigation.goBack()} />
      <View style={styles.screen}>
      <View style={styles.previewContainer}>
        <WebView
          key={hasTypingFinished ? `final-${documentHtml.length}` : `typing-${typingSourceKey}`}
          originWhitelist={['*']}
          source={previewWebViewSource}
          style={styles.webview}
          scalesPageToFit
          scrollEnabled
          showsVerticalScrollIndicator={false}
          onLoadEnd={() => setIsWebViewLoading(false)}
          onLoadStart={() => setIsWebViewLoading(true)}
        />
      </View>

      <View style={[styles.actionBar, { bottom: TAB_BAR_BOTTOM_OFFSET, flexDirection: 'column' }]}>
        <View style={styles.actionRow}>
          <AuthButton
            title="Ստորագրել"
            onPress={handleAddSignature}
            isLoading={isAddingSignature}
            disabled={isActionDisabled}
            isLight
            startIcon={
              <SignatureSvg width={20} height={20} fill={palette.mainBlue} />
            }
            style={styles.rowButton}
          />
          <AuthButton
            title="Ներբեռնել PDF"
            onPress={handleDownloadPdf}
            isLoading={isDownloading}
            disabled={isActionDisabled}
            endIcon={
              <UploadSvg width={20} height={20} fill={palette.white} />
            }
            style={styles.rowButton}
          />
        </View>
        <AuthButton
            title=" Ուղարկված է ՀՀ ՆԳՆ Պարեկային ծառայություն"
            onPress={handleSubmitComplaint}
            isLoading={isSubmittingComplaint}
            disabled={isActionDisabled || !signatureImageSrc}
            endIcon={
              <UploadSvg width={20} height={20} fill={palette.white} />
            }
            style={styles.rowButton}
          />   
        {/* <Pressable
          accessibilityRole="button"
          accessibilityLabel="Submit to police patrol service"
          disabled={isActionDisabled}
          onPress={handleSubmitComplaint}
          style={({ pressed }) => [
            styles.actionButton,
            styles.signatureButton,
            pressed && styles.actionButtonPressed,
            isActionDisabled && styles.actionButtonDisabled,
          ]}
        >
          {isSubmittingComplaint ? (
            <ActivityIndicator color={palette.mainBlue} />
          ) : (
            <Typography variant="h6">
              Ուղարկված է ՀՀ ՆԳՆ Պարեկային ծառայություն
            </Typography>
          )}
        </Pressable> */}
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
      // paddingTop: 1,
      paddingBottom: TAB_BAR_BOTTOM_OFFSET + 120,
      paddingHorizontal: 10,
    },
    previewContainer: {
      flex: 1,
      // height: WEBVIEW_HEIGHT - 100,
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
    actionBar: {
      position: 'absolute',
      left: 20,
      right: 20,
      flexDirection: 'row',
      gap: 12,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 12,
    },
    rowButton: {
      flex: 1,
      marginTop: 0,
    },
    actionButton: {
      flex: 1,
      minHeight: 48,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    signatureButton: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.primary,
    },
    actionButtonPressed: {
      opacity: 0.88,
    },
    actionButtonDisabled: {
      opacity: 0.7,
    },
  });
}
