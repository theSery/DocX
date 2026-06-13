import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import {
  Canvas,
  Circle,
  Group,
  Path,
  RoundedRect,
  Skia,
} from '@shopify/react-native-skia';
import { Typography } from '../typography';
import { useThemedStyles } from '../../hooks';
import { palette } from '../../theme';
import { getYoutubeVideoId } from '../../utils/youtubeUrl';

const CONTROL_BAR_HEIGHT = 56;
const BUTTON_SIZE = 44;
const BUTTON_GAP = 16;
const HORIZONTAL_PADDING = 12;
const PLAY_ICON_SIZE = 14;
const STOP_ICON_SIZE = 16;

const PLAY_BUTTON = {
  x: HORIZONTAL_PADDING,
  centerX: HORIZONTAL_PADDING + BUTTON_SIZE / 2,
  centerY: CONTROL_BAR_HEIGHT / 2,
};

const STOP_BUTTON = {
  x: HORIZONTAL_PADDING + BUTTON_SIZE + BUTTON_GAP,
  centerX: HORIZONTAL_PADDING + BUTTON_SIZE + BUTTON_GAP + BUTTON_SIZE / 2,
  centerY: CONTROL_BAR_HEIGHT / 2,
};

const PLAYER_ERROR_MESSAGES = {
  invalid_parameter: 'Unable to load this YouTube video.',
  HTML5_error: 'Unable to load this YouTube video.',
  video_not_found: 'This YouTube video was not found.',
  embed_not_allowed: 'This video cannot be played inside the app.',
};

/**
 * @param {{
 *   youtubeUrl: string;
 *   width?: number;
 *   aspectRatio?: number;
 *   showLink?: boolean;
 * }} props
 */
export function SkiaVideoPlayer({
  youtubeUrl,
  width,
  aspectRatio = 16 / 9,
  showLink = true,
}) {
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playerError, setPlayerError] = useState(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);

  const videoId = useMemo(() => getYoutubeVideoId(youtubeUrl), [youtubeUrl]);
  const playerWidth = width ?? measuredWidth ?? windowWidth;
  const playerHeight = playerWidth / aspectRatio;

  const handleLayout = useCallback(
    event => {
      if (width) {
        return;
      }

      setMeasuredWidth(event.nativeEvent.layout.width);
    },
    [width],
  );

  const playIconPath = useMemo(() => {
    const path = Skia.Path.Make();
    const { centerX, centerY } = PLAY_BUTTON;
    const halfHeight = PLAY_ICON_SIZE / 2;
    const offsetX = PLAY_ICON_SIZE * 0.35;

    path.moveTo(centerX - offsetX, centerY - halfHeight);
    path.lineTo(centerX + halfHeight, centerY);
    path.lineTo(centerX - offsetX, centerY + halfHeight);
    path.close();

    return path;
  }, []);

  const handlePlayPress = useCallback(() => {
    if (!isPlayerReady) {
      return;
    }

    setPlaying(true);
  }, [isPlayerReady]);

  const handleStopPress = useCallback(() => {
    setPlaying(false);
    playerRef.current?.seekTo(0, true);
  }, []);

  const handleReady = useCallback(() => {
    setIsPlayerReady(true);
    setIsLoading(false);
    setPlayerError(null);
  }, []);

  const handleError = useCallback(error => {
    setPlayerError(
      PLAYER_ERROR_MESSAGES[error] ?? 'Unable to load this YouTube video.',
    );
    setIsLoading(false);
    setPlaying(false);
  }, []);

  const handleChangeState = useCallback(state => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  const handleOpenLink = useCallback(() => {
    Linking.openURL(youtubeUrl).catch(() => {});
  }, [youtubeUrl]);

  if (!videoId) {
    return (
      <View onLayout={handleLayout} style={styles.container}>
        <Typography tone="error" variant="body2">
          Enter a valid YouTube link to preview the video.
        </Typography>
      </View>
    );
  }

  return (
    <View
      onLayout={handleLayout}
      style={[styles.container, width ? { width } : null]}
    >
      <View style={[styles.playerShell, { height: playerHeight }]}>
        {playerWidth > 0 ? (
          <YoutubePlayer
            ref={playerRef}
            height={playerHeight}
            width={playerWidth}
            videoId={videoId}
            play={playing}
            onReady={handleReady}
            onError={handleError}
            onChangeState={handleChangeState}
            initialPlayerParams={{
              controls: 0,
              modestbranding: true,
              rel: false,
              preventFullScreen: true,
            }}
            webViewProps={{
              allowsInlineMediaPlayback: true,
              mediaPlaybackRequiresUserAction: false,
              onLoadStart: () => {
                setIsLoading(true);
                setIsPlayerReady(false);
              },
            }}
            viewContainerStyle={styles.youtubeContainer}
            webViewStyle={styles.webview}
          />
        ) : null}

        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={palette.mainWhite} />
          </View>
        ) : null}
      </View>

      {/* {playerWidth > 0 ? (
        <View style={styles.controlsShell}>
          <Canvas style={{ width: playerWidth, height: CONTROL_BAR_HEIGHT }}>
            <RoundedRect
              x={0}
              y={0}
              width={playerWidth}
              height={CONTROL_BAR_HEIGHT}
              r={12}
              color="rgba(17, 17, 29, 0.88)"
            />

            <Group>
              <Circle
                cx={PLAY_BUTTON.centerX}
                cy={PLAY_BUTTON.centerY}
                r={BUTTON_SIZE / 2}
                color={palette.mainBlue}
              />
              <Path path={playIconPath} color={palette.mainWhite} />
            </Group>

            <Group>
              <Circle
                cx={STOP_BUTTON.centerX}
                cy={STOP_BUTTON.centerY}
                r={BUTTON_SIZE / 2}
                color={palette.red}
              />
              <RoundedRect
                x={STOP_BUTTON.centerX - STOP_ICON_SIZE / 2}
                y={STOP_BUTTON.centerY - STOP_ICON_SIZE / 2}
                width={STOP_ICON_SIZE}
                height={STOP_ICON_SIZE}
                r={2}
                color={palette.mainWhite}
              />
            </Group>
          </Canvas>

          <View style={styles.controlsOverlay}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Play video"
              disabled={!isPlayerReady}
              onPress={handlePlayPress}
              style={({ pressed }) => [
                styles.controlHitArea,
                styles.playHitArea,
                pressed && styles.controlHitAreaPressed,
                !isPlayerReady && styles.controlHitAreaDisabled,
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Stop video"
              disabled={!isPlayerReady}
              onPress={handleStopPress}
              style={({ pressed }) => [
                styles.controlHitArea,
                styles.stopHitArea,
                pressed && styles.controlHitAreaPressed,
                !isPlayerReady && styles.controlHitAreaDisabled,
              ]}
            />
          </View>
        </View>
      ) : null} */}

      {/* {showLink ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Open YouTube link"
          onPress={handleOpenLink}
          style={styles.linkPressable}
        >
          <Typography tone="secondary" variant="caption" style={styles.linkText}>
            {youtubeUrl}
          </Typography>
        </Pressable>
      ) : null} */}

      {playerError ? (
        <Typography tone="error" variant="caption">
          {playerError}
        </Typography>
      ) : null}
    </View>
  );
}

/** @param {import('../../theme/palettes').ThemeColors} _colors */
const createStyles = _colors =>
  StyleSheet.create({
    container: {
      alignSelf: 'stretch',
      gap: 12,
    },
    playerShell: {
      width: '100%',
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: palette.black,
    },
    youtubeContainer: {
      alignSelf: 'stretch',
    },
    webview: {
      backgroundColor: palette.black,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(17, 17, 29, 0.45)',
    },
    controlsShell: {
      height: CONTROL_BAR_HEIGHT,
      position: 'relative',
    },
    controlsOverlay: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      alignItems: 'center',
    },
    controlHitArea: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
    },
    playHitArea: {
      marginLeft: PLAY_BUTTON.x,
    },
    stopHitArea: {
      marginLeft: BUTTON_GAP,
    },
    controlHitAreaPressed: {
      opacity: 0.75,
    },
    controlHitAreaDisabled: {
      opacity: 0.45,
    },
    linkPressable: {
      alignSelf: 'stretch',
    },
    linkText: {
      textDecorationLine: 'underline',
    },
  });
