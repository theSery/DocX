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
  fetchSignatureImageDataUri,
  generateComplaintSerialNumber,
  generateDocumentPdf,
  getPdfWebViewBaseUrl,
  prependSerialNumberToBodyHtml,
} from '../../../documents';
import { complaintsApi, personalDocumentsApi } from '../../../api';
import {
  DOCUMENT_LOADING_OVERLAY_FADE_OUT_MS,
  getNextDocumentLoadingQuote,
  DocumentLoadingOverlay,
} from '../../../components/DocumentLoadingOverlay';
import { AnimatedView } from '../../../components/animation';
import { useAppSelector } from '../../../store';
import { selectDocumentFill } from '../../../store/slices/documentFillSlice';
import { selectPersonalData } from '../../../store/slices/personalDataSlice';
import { selectPersonalDocuments } from '../../../store/slices/personalDocumentsSlice';
import {
  useFileDownload,
  useTheme,
  useThemedStyles,
  useToast,
} from '../../../hooks';
import { palette } from '../../../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';
import MainHeader from '../../../components/headers/MainHeader';
import SendSvg from '../../../components/icons/SendSvg';
import { SolutionAttachmentsSheet } from './components/SolutionAttachmentsSheet';
import { useSolutionAttachmentUpload } from './hooks/useSolutionAttachmentUpload';

/** Fixed loading + document generation duration for this screen only. */
const DOCUMENT_CREATE_LOADING_DURATION = 7000;
/** Swap to the final document after the overlay has mostly faded away. */
const DOCUMENT_REVEAL_SWAP_DELAY_MS = Math.round(
  DOCUMENT_LOADING_OVERLAY_FADE_OUT_MS * 0.55,
);

export function DocumentCreateScreen({ route, navigation }) {

  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { isDownloading, shareGeneratedPdf } = useFileDownload();
  const personalData = useAppSelector(selectPersonalData);
  const documentFill = useAppSelector(selectDocumentFill);
  const personalDocuments = useAppSelector(selectPersonalDocuments);
  const { templateText = '', templateName = 'document', templateId, templateSolution } = route.params ?? {};
  const [hasTypingFinished, setHasTypingFinished] = useState(false);
  const [isTypingWebViewReady, setIsTypingWebViewReady] = useState(false);
  const [isAddingSignature, setIsAddingSignature] = useState(false);
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [signatureImageSrc, setSignatureImageSrc] = useState(null);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const [loadingQuote, setLoadingQuote] = useState(getNextDocumentLoadingQuote);
  const [isAttachmentsSheetVisible, setIsAttachmentsSheetVisible] =
    useState(false);
  const [uploadedAttachmentIds, setUploadedAttachmentIds] = useState(
    () => new Set(),
  );

  const handleAttachmentUploaded = useCallback(attachedDocumentId => {
    if (attachedDocumentId == null) {
      return;
    }

    setUploadedAttachmentIds(prev => {
      const next = new Set(prev);
      next.add(String(attachedDocumentId));
      return next;
    });
  }, []);

  const { pickFromGallery, pickFromFiles } = useSolutionAttachmentUpload({
    onUploaded: handleAttachmentUploaded,
  });

  const userId = personalData?.id ?? personalData?.userId;

  const solutionAttachments = useMemo(
    () => templateSolution?.solutionAttachments ?? [],
    [templateSolution?.solutionAttachments],
  );

  const attachmentRows = useMemo(() => {
    return solutionAttachments.map((attachment, index) => {
      const attachedDocumentId =
        attachment?.attachedDocumentId ?? attachment?.attachedDocument?.id;
      const name =
        attachment?.attachedDocument?.name ??
        attachment?.name ??
        `Կցորդ ${index + 1}`;

      const personalDocument =
        personalDocuments.find(
          item =>
            String(item.attachedDocumentId) === String(attachedDocumentId),
        ) ??
        personalDocuments.find(item => item.documentName === name) ??
        null;

      const isUploaded =
        Boolean(personalDocument?.isUploaded) ||
        Boolean(personalDocument?.documentUrl) ||
        uploadedAttachmentIds.has(String(attachedDocumentId));

      return {
        key: String(attachment?.id ?? attachedDocumentId ?? index),
        attachedDocumentId,
        name,
        isUploaded,
        personalDocument,
      };
    });
  }, [personalDocuments, solutionAttachments, uploadedAttachmentIds]);

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
    setIsTypingWebViewReady(false);
    setLoadingQuote(getNextDocumentLoadingQuote());
    setShowLoadingOverlay(true);
  }, [typingSourceKey]);

  // Start the fixed 7s clock only after the typing WebView has loaded,
  // so generation + overlay always run the full duration together.
  // Fade the overlay first, then swap to the final document mid-fade.
  useEffect(() => {
    if (!isTypingWebViewReady || hasTypingFinished) {
      return undefined;
    }

    const hideOverlayTimer = setTimeout(() => {
      setShowLoadingOverlay(false);
    }, DOCUMENT_CREATE_LOADING_DURATION);

    const revealDocumentTimer = setTimeout(() => {
      setHasTypingFinished(true);
    }, DOCUMENT_CREATE_LOADING_DURATION + DOCUMENT_REVEAL_SWAP_DELAY_MS);

    return () => {
      clearTimeout(hideOverlayTimer);
      clearTimeout(revealDocumentTimer);
    };
  }, [isTypingWebViewReady, hasTypingFinished, typingSourceKey]);

  const previewWebViewSource = useMemo(
    () => ({
      html: hasTypingFinished
        ? documentHtml
        : buildTypingAnimationHtml(
            typingBodyHtml,
            DOCUMENT_CREATE_LOADING_DURATION,
          ),
      baseUrl: getPdfWebViewBaseUrl(),
    }),
    [hasTypingFinished, documentHtml, typingBodyHtml],
  );

  const handleDownloadPdf = useCallback(() => {
    return shareGeneratedPdf({
      documentHtml,
      fileName: `docx_${templateName.replace(/\s+/g, '_')}_${Date.now()}`,
    });
  }, [documentHtml, shareGeneratedPdf, templateName]);

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
console.log(templateSolution, 'ppppppp')
  // Test helper for POST /api/complaints/{id}/send
  const testSendComplaint = useCallback(
    async complaintId => {
      if (!complaintId) {
        console.log('[testSendComplaint] Missing complaint id, skipping send');
        return;
      }

      const attachedDocuments = (templateSolution?.solutionAttachments ?? [])
        .map(attachment => attachment?.attachedDocumentId ?? attachment?.attachedDocument?.id)
        .filter(id => id != null);

      try {
        const response = await complaintsApi.sendComplaint(complaintId, {
          recipientType: 'lawyer',
          recipientEmail: templateSolution?.addressee?.email ?? '',
          addresseeEmail: personalData?.email ?? '',
          attachedDocuments,
        });

      } catch (error) {
        console.log(
          `[testSendComplaint] POST /complaints/${complaintId}/send error`,
          error,
        );
      }
    },
    [personalData?.email, templateSolution],
  );

  const submitComplaint = useCallback(async () => {
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

      const createResponse = await complaintsApi.createComplaint({
        ...payload,
        file: {
          uri: pdf.filePath,
          name: payload.documentName,
          type: 'application/pdf',
        },
      });

      const createdComplaintId =
        createResponse.data?.data?.id ?? createResponse.data?.id;
      await testSendComplaint(createdComplaintId);

      showToast({
        title: 'Հաջողություն',
        body: 'Փաստաթուղթը ուղարկված է ՀՀ ՆԳՆ Պարեկային ծառայություն։',
        type: 'success',
      });

      try {
        await personalDocumentsApi.getPersonalDocuments();
      } catch (refreshError) {
        console.log(refreshError, 'personal documents refresh error');
      }

      setIsAttachmentsSheetVisible(false);

      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeMain' }],
      });
      navigation.navigate('Documents', {
        screen: 'DocumentsMain',
        params: { refreshedAt: Date.now() },
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
    testSendComplaint,
  ]);

  const handleSubmitComplaint = useCallback(() => {
    if (solutionAttachments.length > 0) {
      setIsAttachmentsSheetVisible(true);
      return;
    }

    return submitComplaint();
  }, [solutionAttachments.length, submitComplaint]);

  const handleAttachmentView = useCallback(
    row => {
      const document = row.personalDocument;
      if (!document) {
        return;
      }

      setIsAttachmentsSheetVisible(false);
      navigation.navigate('Files', {
        screen: 'PersonalDocumentView',
        params: {
          id: document.id,
          title: document.documentName ?? row.name,
          documentUrl: document.documentUrl,
          downloadUrl: document.downloadUrl,
        },
      });
    },
    [navigation],
  );

  const isActionDisabled =
    !hasTypingFinished ||
    isDownloading ||
    isAddingSignature ||
    isSubmittingComplaint;

  return (
    <View style={styles.root}>
      <MainHeader onPress={() => navigation.goBack()} />
      <View style={styles.screen}>
        <View style={styles.previewShadow}>
          <View style={styles.previewContainer}>
            <WebView
              key={hasTypingFinished ? `final-${documentHtml.length}` : `typing-${typingSourceKey}`}
              originWhitelist={['*']}
              source={previewWebViewSource}
              style={styles.webview}
              scalesPageToFit
              scrollEnabled
              showsVerticalScrollIndicator={false}
              onLoadEnd={() => {
                if (!hasTypingFinished) {
                  setIsTypingWebViewReady(true);
                }
              }}
            />
          </View>
        </View>
        {hasTypingFinished ? (
          <AnimatedView
            animation="fadeIn"
            duration={480}
            delay={80}
            style={styles.actionRow}
          >

            <Pressable
              onPress={handleDownloadPdf}
              disabled={isActionDisabled}
              style={styles.topButton}
            >
              <UploadSvg width={25} height={25} fill={colors.icons} />
            </Pressable>
          </AnimatedView>
        ) : null}
        <View style={[styles.actionBar, { bottom: TAB_BAR_BOTTOM_OFFSET, flexDirection: 'column' }]}>

          <AuthButton
            title={
              signatureImageSrc
                ? (`Ուղարկել ${templateSolution?.addressee?.name}` ?? 'Ուղարկել')
                : 'Ստորագրություն'
            }
            onPress={
              signatureImageSrc ? handleSubmitComplaint : handleAddSignature
            }
            isLoading={
              signatureImageSrc ? isSubmittingComplaint : isAddingSignature
            }
            disabled={isActionDisabled}
            endIcon={
              signatureImageSrc ? (
                <SendSvg width={20} height={20} fill={palette.white} />
              ) : (
                <SignatureSvg width={25} height={25} fill={palette.white} />
              )
            }
            style={styles.rowButton}
          />

        </View>

      </View>

      <DocumentLoadingOverlay
        visible={showLoadingOverlay}
        quote={loadingQuote}
      />

      <SolutionAttachmentsSheet
        visible={isAttachmentsSheetVisible}
        attachments={attachmentRows}
        onClose={() => setIsAttachmentsSheetVisible(false)}
        onPickFromGallery={pickFromGallery}
        onPickFromFiles={pickFromFiles}
        onView={handleAttachmentView}
        onConfirm={submitComplaint}
        isConfirming={isSubmittingComplaint}
      />
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
      paddingBottom: TAB_BAR_BOTTOM_OFFSET + 60,
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
      backgroundColor: colors.border,
      borderWidth: 1,
      borderColor: colors.border,
    },
    webview: {
      flex: 1,
      backgroundColor: palette.pureWhite,
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
      // flexDirection: 'row',
      gap: 12,
      position: 'absolute',
      // left: 20,
      right: 20,
      top: 20,
zIndex: 1000,
    },
    rowButton: {
      flex: 1,
      marginTop: 0,
    },
    topButton: {
      // flex: 1,
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.icons,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 0,
      opacity: 0.8,
      transition: 'opacity 0.3s ease-in-out',
      '&:hover': {
        opacity: 1,
      },
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
      borderColor: colors.icons,
    },
    actionButtonPressed: {
      opacity: 0.88,
    },
    actionButtonDisabled: {
      opacity: 0.7,
    },
  });
}
