import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Typography } from '../typography';
import { useThemedStyles } from '../../hooks';
import { palette } from '../../theme';
import { getYoutubeVideoId } from '../../utils/youtubeUrl';

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
 * }} props
 */
export function SkiaVideoPlayer({
  youtubeUrl,
  width,
  aspectRatio = 16 / 9,
}) {
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const [playing, setPlaying] = useState(false);
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

  const handleReady = useCallback(() => {
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
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(17, 17, 29, 0.45)',
    },
  });
