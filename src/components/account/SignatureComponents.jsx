import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import GradientButton from '../buttons/GradientButton';
import { Typography } from '../typography';
import { useGlobalStyles, useThemedStyles, useTheme } from '../../hooks';
import { FONT_FAMILY, palette } from '../../theme';
import { WIDTH } from '../../utils/dimensions';
import { extractHandwritingToTransparentPng } from '../../utils/handwritingExtractor';

const INPUT_RADIUS = 16;
const STROKE_COLOR = '#000000';
const STROKE_WIDTH = 3;

const SIGNATURE_MODES = [
  { id: 'draw', label: 'Նկարել' },
  { id: 'camera', label: 'Լուսանկար' },
];



function SignatureDrawCanvas() {
  const canvasRef = useCanvasRef();
  const styles = useThemedStyles(createStyles);

  const [paths, setPaths] = useState([]);
  const currentPathBuilder = useRef(null);

  const startPath = useCallback((x, y) => {
    const builder = Skia.PathBuilder.Make().moveTo(x, y);
    currentPathBuilder.current = builder;

    setPaths((prev) => [
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

    setPaths((prev) => {
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
    .minDistance(0)
    .runOnJS(true)
    .onBegin((e) => {
      startPath(e.x, e.y);
    })
    .onUpdate((e) => {
      updatePath(e.x, e.y);
    })
    .onEnd(() => {
      endPath();
    });

  const clearCanvas = () => {
    setPaths([]);
  };

  const savePng = () => {
    const img = canvasRef.current?.makeImageSnapshot()?.encodeToBase64();
    if (!img) {
      Alert.alert('Սխալ', 'Ստորագրությունը դատարկ է');
      return;
    }
    const data = `data:image/png;base64,${img}`;
    Share.share({ url: data });
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
          <Canvas ref={canvasRef} style={styles.canvas}>
            {renderedPaths}
          </Canvas>
        </GestureDetector>
      </View>

      <View style={styles.drawButtons}>
        <Pressable
          style={({ pressed }) => [styles.outlineButton, pressed && styles.buttonPressed]}
          onPress={clearCanvas}
        >
          <Typography variant="h5" style={styles.outlineButtonText}>
            Մաքրել
          </Typography>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          onPress={savePng}
        >
          <GradientButton height={45} isLight={false}>
            <Typography variant="h5" style={styles.primaryButtonText}>
              Պահպանել PNG
            </Typography>
          </GradientButton>
        </Pressable>
      </View>
    </View>
  );
}

function SignatureCameraCapture() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [sourceUri, setSourceUri] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onPickerResponse = useCallback(async (response) => {
    if (response.didCancel) {
      return;
    }
    if (response.errorCode) {
      Alert.alert('Սխալ', response.errorMessage ?? response.errorCode);
      return;
    }

    const asset = response.assets?.[0];
    if (!asset?.uri) {
      Alert.alert('Նկար չի ընտրվել', 'Ընտրեք կամ լուսանկարեք վավեր ստորագրության նկար։');
      return;
    }

    setSourceUri(asset.uri);
    setProcessedImage(null);
    setIsProcessing(true);
    try {
      const result = await extractHandwritingToTransparentPng(asset.uri, {
        brightnessThreshold: 0.87,
        contrast: 1.16,
        saturationGuard: 0.16,
      });
      const normalizedPath =
        Platform.OS === 'android' ? `file://${result.outputPath}` : result.outputPath;
      setProcessedImage({
        path: normalizedPath,
        width: result.width,
        height: result.height,
      });
      Alert.alert('Պատրաստ է', `Թափանցիկ PNG-ը պահպանվել է տեղայնորեն:\n${result.outputPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Անհայտ մշակման սխալ';
      Alert.alert('Մշակումը ձախողվեց', message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const pickFromGallery = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      onPickerResponse,
    );
  }, [onPickerResponse]);

  const pickFromCamera = useCallback(() => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        saveToPhotos: false,
      },
      onPickerResponse,
    );
  }, [onPickerResponse]);

  const requestAndroidSavePermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (Platform.Version >= 29) {
      return true;
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Պահեստի թույլտվություն',
        message: 'Թույլ տվեք պահեստին մուտքը, որպեսզի պահպանեք PNG-ը պատկերասրահում։',
        buttonPositive: 'Թույլատրել',
        buttonNegative: 'Մերժել',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  const saveProcessedImage = useCallback(async () => {
    if (!processedImage) {
      Alert.alert(
        'Մշակված նկար չկա',
        'Նախ առանձնացրեք ստորագրությունը, ապա պահպանեք արդյունքը։',
      );
      return;
    }

    try {
      const hasPermission = await requestAndroidSavePermission();
      if (!hasPermission) {
        Alert.alert(
          'Թույլտվությունը մերժվել է',
          'Պահեստի թույլտվություն անհրաժեշտ է նկարը պահպանելու համար։',
        );
        return;
      }
      const saveUri =
        processedImage.path.startsWith('file://') || Platform.OS === 'android'
          ? processedImage.path
          : `file://${processedImage.path}`;
      const savedUri = await CameraRoll.save(saveUri, {
        type: 'photo',
        album: 'DocX Ստորագրություններ',
      });
      Alert.alert('Պահպանված է', `Թափանցիկ PNG-ը պահպանվել է պատկերասրահում:\n${savedUri}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Անհայտ պահպանման սխալ';
      const isIosPhotosPermissionError =
        Platform.OS === 'ios' &&
        /PHPhotosErrorDomain/i.test(message) &&
        /\b3311\b/.test(message);
      if (isIosPhotosPermissionError) {
        Alert.alert(
          'Պատկերասրահի մուտք',
          'Թույլ տվեք պատկերասրահի մուտքը (ավելացնել կամ ամբողջական) PNG-ը պահպանելու համար։',
          [
            { text: 'Չեղարկել', style: 'cancel' },
            {
              text: 'Բացել կարգավորումները',
              onPress: () => {
                Linking.openSettings().catch(() => {
                  Alert.alert('Սխալ', 'Բացեք կարգավորումները ձեռքով։');
                });
              },
            },
          ],
        );
        return;
      }
      Alert.alert('Պահպանելը ձախողվեց', message);
    }
  }, [processedImage, requestAndroidSavePermission]);

  return (
    <View style={styles.cameraContainer}>
      <View style={styles.cameraButtonRow}>
        <Pressable
          style={({ pressed }) => [styles.cameraButton, pressed && styles.buttonPressed]}
          onPress={pickFromGallery}
        >
          <GradientButton height={45} isLight={false}>
            <Typography variant="h5" style={styles.primaryButtonText}>
              Վերբեռնել պատկերասրահից
            </Typography>
          </GradientButton>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.cameraButton, pressed && styles.buttonPressed]}
          onPress={pickFromCamera}
        >
          <GradientButton height={45} isLight={false}>
            <Typography variant="h5" style={styles.primaryButtonText}>
              Լուսանկարել
            </Typography>
          </GradientButton>
        </Pressable>
      </View>

      {isProcessing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Typography variant="h6" tone="secondary" style={styles.processingLabel}>
            Ստորագրության առանձնացում և ֆոնի հեռացում...
          </Typography>
        </View>
      ) : null}

      <View style={styles.previewRow}>
        <View style={styles.previewCard}>
          <Typography variant="h5">Սկզբնական</Typography>
          {sourceUri ? (
            <Image source={{ uri: sourceUri }} style={styles.previewImage} resizeMode="contain" />
          ) : (
            <Typography variant="h6" tone="secondary">
              Սկզբնական նկար չի ընտրվել։
            </Typography>
          )}
        </View>

        <View style={styles.previewCard}>
          <Typography variant="h5">Թափանցիկ արդյունք</Typography>
          {processedImage ? (
            <>
              <View style={styles.transparencyBoard}>
                <Image
                  source={{ uri: processedImage.path }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </View>
              <Typography variant="h6" tone="secondary">
                {processedImage.width}x{processedImage.height} PNG պահպանվել է տեղայնորեն
              </Typography>
              <Pressable
                style={({ pressed }) => [styles.saveResultButton, pressed && styles.buttonPressed]}
                onPress={saveProcessedImage}
              >
                <GradientButton height={45} isLight={false}>
                  <Typography variant="h5" style={styles.primaryButtonText}>
                    Պահպանել արդյունքը
                  </Typography>
                </GradientButton>
              </Pressable>
            </>
          ) : (
            <Typography variant="h6" tone="secondary">
              Մշակված արդյունքը կցուցադրվի այստեղ առանձնացումից հետո։
            </Typography>
          )}
        </View>
      </View>
    </View>
  );
}

export function SignatureComponents() {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const [mode, setMode] = useState('draw');

  return (
    <ScrollView
      style={globalStyles.screen}
      contentContainerStyle={[globalStyles.container, styles.screenContent]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Typography variant="h4" style={styles.title}>
        Ստորագրություն
      </Typography>
      <Typography variant="h5" tone="secondary" style={styles.subtitle}>
        Նկարեք կամ լուսանկարեք ձեր ստորագրությունը։
      </Typography>

      <View style={styles.modeTabs}>
        {SIGNATURE_MODES.map((item) => {
          const isActive = mode === item.id;
          return (
            <Pressable
              key={item.id}
              style={[styles.modeTab, isActive && styles.modeTabActive]}
              onPress={() => setMode(item.id)}
            >
              <Typography variant="h5" tone={isActive ? 'onDark' : 'default'}>
                {item.label}
              </Typography>
            </Pressable>
          );
        })}
      </View>

      {mode === 'draw' ? <SignatureDrawCanvas /> : <SignatureCameraCapture />}
    </ScrollView>
  );
}
const createStyles = (colors) =>
    StyleSheet.create({
      screenContent: {
        paddingTop: 20,
        paddingBottom: 32,
        gap: 16,
      },
      title: {
        letterSpacing: 0.9,
      },
      subtitle: {
        lineHeight: 20,
      },
      modeTabs: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: INPUT_RADIUS,
        overflow: 'hidden',
      },
      modeTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
      },
      modeTabActive: {
        backgroundColor: colors.primary,
      },
      drawContainer: {
        alignItems: 'center',
      },
      paper: {
        width: WIDTH - 40,
        height: 320,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        overflow: 'hidden',
      },
      canvas: {
        flex: 1,
        backgroundColor: 'transparent',
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
      cameraContainer: {
        gap: 14,
      },
      cameraButtonRow: {
        flexDirection: 'row',
        gap: 10,
      },
      cameraButton: {
        flex: 1,
        height: 45,
        overflow: 'hidden',
        borderRadius: INPUT_RADIUS,
      },
      loader: {
        alignItems: 'center',
        paddingVertical: 12,
        gap: 8,
      },
      processingLabel: {
        textAlign: 'center',
      },
      previewRow: {
        gap: 12,
      },
      previewCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: 10,
        minHeight: 220,
        gap: 8,
      },
      previewImage: {
        width: '100%',
        height: 180,
        borderRadius: 8,
      },
      transparencyBoard: {
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: colors.input,
      },
      saveResultButton: {
        marginTop: 2,
        height: 45,
        overflow: 'hidden',
        borderRadius: INPUT_RADIUS,
      },
    });