import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
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
import { AnimatedView, Typography } from '../../../components';
import { useAppSelector } from '../../../store';
import { selectDocumentFill } from '../../../store/slices/documentFillSlice';
import { selectPersonalData } from '../../../store/slices/personalDataSlice';
import { useThemedStyles } from '../../../hooks';
import { palette } from '../../../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';
import MainHeader from '../../../components/headers/MainHeader';
import LottieAnimation from '../../../components/animation/LottieAnimation';
import LogoIcon from '../../../components/icons/LogoIcon';

const WEBVIEW_HEIGHT = 10000;
const POST_LOAD_OVERLAY_DURATION = 1000;
const INSPIRATIONAL_QUOTE =
  '«Յուրաքանչյուր նոր փաստաթուղթ՝ քո ապագայի քայլ է»';

export function DocumentCreateScreen({ route, navigation }) {

  const styles = useThemedStyles(createStyles);
  const personalData = useAppSelector(selectPersonalData);
  const documentFill = useAppSelector(selectDocumentFill);
  const { templateText = '', templateName = 'document' } = route.params ?? {};
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [hasTypingFinished, setHasTypingFinished] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAddingSignature, setIsAddingSignature] = useState(false);
  const [signatureImageSrc, setSignatureImageSrc] = useState(null);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

  const isContentLoading = !hasTypingFinished || isWebViewLoading;

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

  useEffect(() => {
    if (isContentLoading) {
      setShowLoadingOverlay(true);
      return;
    }

    const timer = setTimeout(() => {
      setShowLoadingOverlay(false);
    }, POST_LOAD_OVERLAY_DURATION);

    return () => clearTimeout(timer);
  }, [isContentLoading]);

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
    showLoadingOverlay || isDownloading || isAddingSignature;

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

      <Modal
        visible={showLoadingOverlay}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.fullScreenOverlay}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={1}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.5)"
            {...(Platform.OS === 'android' && {
              overlayColor: 'rgba(0, 0, 0, 0.25)',
            })}
          />
          <View style={styles.overlayTint} />
          <View style={styles.overlayContent}>
            <AnimatedView animation="fadeInDown" duration={600} style={styles.logoContainer}>
              <LogoIcon width={72} height={72} />
            </AnimatedView>

            <AnimatedView animation="fadeIn" delay={350} duration={600}>
              <Typography variant="h4" tone="onDark" style={styles.quote}>
                {INSPIRATIONAL_QUOTE}
              </Typography>
            </AnimatedView>

         
          </View>
          <AnimatedView animation="fadeIn" delay={650} duration={600} style={[styles.lottieContainer, { marginBottom: 50, marginTop: 0 }]}>
              <LottieAnimation
                source={require('../../../assets/lottie/Law.json')}
                autoPlay
                loop
                style={styles.lottie}
              />
            </AnimatedView>
        </View>
      </Modal>
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
    fullScreenOverlay: {
      flex: 1,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    },
    overlayTint: {
      ...StyleSheet.absoluteFill,
      // backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    overlayContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    logoContainer: {
      marginBottom: 24,
    },
    lottieContainer: {
      marginTop: 28,
    },
    lottie: {
      width: 160,
      height: 100,
    },
    quote: {
      textAlign: 'center',
      fontStyle: 'italic',
      fontSize: 18,
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
