import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
  Image as SkiaImage,
  useImage,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { launchImageLibrary } from 'react-native-image-picker';
import GradientButton from '../buttons/GradientButton';
import { signatureApi } from '../../api';
import { Typography } from '../typography';
import { useGlobalStyles, useThemedStyles, useToast } from '../../hooks';
import { FONT_FAMILY, palette } from '../../theme';
import { WIDTH } from '../../utils/dimensions';
import { extractHandwritingToTransparentPng } from '../../utils/handwritingExtractor';
import { runAfterSheetDismiss } from '../../utils/runAfterSheetDismiss';
import TrashSvg from '../icons/TrashSvg';
import PenSvg from '../icons/PenSvg';
import { showGlobalSheet } from '../GlobalSheet';
import CameraSvg from '../icons/CameraSvg';
import CloseSvg from '../icons/CloseSvg';
import CleareSvg from '../icons/CleareSvg';

const INPUT_RADIUS = 16;
const STROKE_COLOR = '#000000';
const STROKE_WIDTH = 3;

function SignatureDrawCanvas({ signatureUrl, handleDeleteSignaturePress }) {
  const canvasRef = useCanvasRef();
  const styles = useThemedStyles(createStyles);
  const { showToast } = useToast();

  const [paths, setPaths] = useState([]);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pickedImageUri, setPickedImageUri] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const currentPathBuilder = useRef(null);

  const signatureImage = useImage(pickedImageUri ?? signatureUrl ?? null);

  const onCanvasLayout = useCallback(e => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ width, height });
  }, []);

  const startPath = useCallback((x, y) => {
    const builder = Skia.PathBuilder.Make().moveTo(x, y);
    currentPathBuilder.current = builder;

    setPaths(prev => [
      ...prev,
      {
        path: builder.build(),
        color: STROKE_COLOR,
        strokeWidth: STROKE_WIDTH,
      },
    ]);
  }, []);

  const updatePath = useCallback((x, y) => {
    if (!currentPathBuilder.current) return;

    currentPathBuilder.current.lineTo(x, y);
    const updatedPath = currentPathBuilder.current.build();

    setPaths(prev => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      next[next.length - 1] = {
        ...next[next.length - 1],
        path: updatedPath,
      };
      return next;
    });
  }, []);

  const endPath = useCallback(() => {
    currentPathBuilder.current = null;
  }, []);

  const panGesture = Gesture.Pan()
    .enabled(isDrawingEnabled)
    .minDistance(0)
    .runOnJS(true)
    .onBegin(e => {
      startPath(e.x, e.y);
    })
    .onUpdate(e => {
      updatePath(e.x, e.y);
    })
    .onEnd(() => {
      endPath();
    });

  const clearCanvas = () => {
    setPaths([]);
    setPickedImageUri(null);
    setIsImageVisible(false);
  };

  const hasDefaultImage = Boolean(signatureImage && isImageVisible);

  const savePng = async () => {
    if (paths.length === 0 && !hasDefaultImage) {
      showToast({ title: 'Ստորագրությունը դատարկ է', type: 'error' });
      return;
    }
    const img = canvasRef.current?.makeImageSnapshot()?.encodeToBase64();
    if (!img) {
      showToast({ title: 'Ստորագրությունը դատարկ է', type: 'error' });
      return;
    }

    setIsSaving(true);
    const filePath = `${RNFS.CachesDirectoryPath}/signature-${Date.now()}.png`;
    const isEditingExisting = isDrawingEnabled && Boolean(signatureUrl);
    try {
      await RNFS.writeFile(filePath, img, 'base64');
      if (isEditingExisting) {
        console.log('isEditingExisting', isEditingExisting);
        await signatureApi.updateSignature({ uri: `file://${filePath}` });
      } else {
        await signatureApi.uploadSignature({ uri: `file://${filePath}` });
      }
      showToast({ title: 'Ստորագրությունը պահպանվել է', type: 'success' });
    } catch (error) {
      console.log('error', error);
      showToast({
        title: 'Պահպանելը ձախողվեց',
        body: error?.message ?? 'Անհայտ սխալ, փորձեք կրկին',
        type: 'error',
      });
    } finally {
      RNFS.unlink(filePath).catch(() => { });
      setIsSaving(false);
    }
  };
  const onPickerResponse = useCallback(async response => {
    if (response.didCancel) {
      return;
    }
    if (response.errorCode) {
      showToast({
        title: 'Սխալ',
        body: response.errorMessage ?? response.errorCode,
        type: 'error',
      });
      return;
    }

    const asset = response.assets?.[0];
    if (!asset?.uri) {
      showToast({
        title: 'Նկար չի ընտրվել',
        body: 'Ընտրեք կամ լուսանկարեք վավեր ստորագրության նկար։',
        type: 'error',
      });
      return;
    }

    setPaths([]);
    setPickedImageUri(null);
    setIsProcessing(true);
    try {
      const result = await extractHandwritingToTransparentPng(asset.uri, {
        brightnessThreshold: 0.87,
        contrast: 1.16,
        saturationGuard: 0.16,
      });
      setPickedImageUri(`file://${result.outputPath}`);
      setIsImageVisible(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Անհայտ մշակման սխալ';
      showToast({ title: 'Մշակումը ձախողվեց', body: message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  }, [showToast]);

  const openImageLibrary = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      onPickerResponse,
    );
  }, [onPickerResponse]);

  const pickFromGallery = useCallback(() => {
    runAfterSheetDismiss(openImageLibrary);
  }, [openImageLibrary]);
  const handlePickFromGallery = () => {
    showGlobalSheet({
      content: require('../../assets/images/sigExample.jpg'),
      message: 'Ստորագրեք սպիտակ թղթի վրա, լուսանկարեք և բերեք նկարը։',
      description:
        'Այս պատկերը օգտագործվում է որպես օրինակ ստորագրության համար։',
      actions: [
        { label: 'Ընտրել', onPress: pickFromGallery },
        { label: 'Չեղարկել' },
      ],
    });
  };
  const renderedPaths = useMemo(() => {
    return paths.map((item, index) => (
      <Path
        key={index}
        path={item.path}
        color={item.color}
        style="stroke"
        strokeWidth={item.strokeWidth}
        strokeCap="round"
        strokeJoin="round"
      />
    ));
  }, [paths]);

  return (
    <View style={styles.drawContainer}>
      <View style={styles.paper}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.canvas} onLayout={onCanvasLayout}>
            <Canvas ref={canvasRef} style={styles.canvas}>
              {hasDefaultImage && canvasSize.width > 0 ? (
                <SkiaImage
                  image={signatureImage}
                  x={0}
                  y={0}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  fit="contain"
                />
              ) : null}
              {renderedPaths}
            </Canvas>
          </View>
        </GestureDetector>
        {isProcessing ? (
          <View style={styles.canvasLoader}>
            <ActivityIndicator size="large" color={palette.mainBlue} />
          </View>
        ) : null}
      </View>
      <View style={styles.imageContainer}>
        <Pressable
          style={styles.trashButton}
          onPress={() => {
            setIsDrawingEnabled(prev => !prev);
            // clearCanvas();
          }}
        >
          <GradientButton height={50} isLight={isDrawingEnabled}>
            {!isDrawingEnabled ? (
              <PenSvg width={20} height={20} fill={palette.white} />
            ) : (
              <CloseSvg width={16} height={16} fill={palette.mainBlue} />
            )}
          </GradientButton>
        </Pressable>
        {isDrawingEnabled && (
          <Pressable style={styles.trashButton} onPress={clearCanvas}>
            <GradientButton height={50} isLight={true}>
              <CleareSvg width={20} height={20} fill={palette.mainBlue} />
            </GradientButton>
          </Pressable>
        )}
        {signatureUrl && (
          <Pressable
            style={styles.trashButton}
            onPress={handleDeleteSignaturePress}
          >
            <GradientButton height={50} isLight={true}>
              <TrashSvg width={22} height={22} fill={palette.mainBlue} />
            </GradientButton>
          </Pressable>
        )}
        {isDrawingEnabled && (
          <Pressable style={styles.trashButton} onPress={handlePickFromGallery}>
            <GradientButton height={50} isLight={true}>
              <CameraSvg width={25} height={25} fill={palette.mainBlue} />
            </GradientButton>
          </Pressable>
        )}
        {/* */}
      </View>
      <View style={styles.drawButtons}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={savePng}
          disabled={isSaving}
        >
          <GradientButton height={45} isLight={false}>
            {isSaving ? (
              <ActivityIndicator size="small" color={palette.white} />
            ) : (
              <Typography variant="h5" style={styles.primaryButtonText}>
                Պահպանել ստորագրությունը
              </Typography>
            )}
          </GradientButton>
        </Pressable>
      </View>
    </View>
  );
}

export function SignatureComponents() {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { showToast } = useToast();
  const [signature, setSignature] = useState(null);
  useEffect(() => {
    signatureApi
      .getSignature()
      .then(result => {
        // console.log('signature result', result);
        setSignature(result.data);
      })
      .catch(error => {
        console.log('signature error', error);
      });
  }, []);

  const handleDeleteSignature = async () => {
    try {
      await signatureApi.deleteSignature();
      setSignature(null);
    } catch (error) {
      console.log('delete signature error', error);
      showToast({
        title: 'Ջնջելը ձախողվեց',
        body: error?.message ?? 'Անհայտ սխալ, փորձեք կրկին',
        type: 'error',
      });
    }
  };
  const handleDeleteSignaturePress = () => {
    showGlobalSheet({
      // content: signature?.fileUrl ?? null,
      message: 'Դուք պատրաստվում եք ջնջել ստորագրությունը',
      // description: 'Հաշիվը ջնջելով կորցնում եք հասանելիությունը բոլոր տվյալներին, Ձեր կողմից ստեղծված բոլոր փաստաթղթերին',
      actions: [
        { label: 'Ջնջել', destructive: true, onPress: handleDeleteSignature },
        { label: 'Չեղարկել' },
      ],
    });
  };

  return (
    <ScrollView
      style={globalStyles.screen}
      contentContainerStyle={[globalStyles.container, styles.screenContent]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <SignatureDrawCanvas
        signatureUrl={signature?.fileUrl}
        handleDeleteSignaturePress={handleDeleteSignaturePress}
      />
    </ScrollView>
  );
}
const createStyles = colors =>
  StyleSheet.create({
    screenContent: {
      paddingBottom: 32,
      gap: 16,
      paddingTop: 20,
    },
    title: {
      letterSpacing: 0.9,
    },
    drawContainer: {
      alignItems: 'center',
      height: '80%',
    },
    paper: {
      width: WIDTH - 40,
      height: '100%',
      backgroundColor: '#FAFBFF',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      overflow: 'hidden',
    },
    canvas: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    canvasLoader: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(250, 251, 255, 0.7)',
    },
    drawButtons: {
      flexDirection: 'row',
      marginTop: 20,
      gap: 12,
      width: WIDTH - 40,
    },
    outlineButton: {
      flex: 1,
      height: 45,
      borderRadius: INPUT_RADIUS,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outlineButtonText: {
      color: palette.mainBlue,
      letterSpacing: 1.2,
    },
    primaryButton: {
      flex: 1,
      height: 45,
      overflow: 'hidden',
      borderRadius: INPUT_RADIUS,
    },
    primaryButtonText: {
      fontFamily: FONT_FAMILY.regular,
      color: palette.white,
      letterSpacing: 1.2,
    },
    buttonPressed: {
      opacity: 0.88,
    },
    imageContainer: {
      position: 'absolute',
      flexDirection: 'row',
      gap: 10,
      top: 10,
      zIndex: 10,

      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    trashButton: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 50,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
  });
