import { ScrollView, StyleSheet, View } from 'react-native';
import { SkiaVideoPlayer, Typography } from '../../../components';
import { useMainScreenStyles, useThemedStyles } from '../../../hooks';

const DEMO_YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

export function FilesScreen() {
  const globalStyles = useMainScreenStyles();
  const styles = useThemedStyles(createStyles);

  return (
    <ScrollView
      contentContainerStyle={[globalStyles.container, styles.content]}
      showsVerticalScrollIndicator={false}
    >
      <Typography variant="h5">Video preview</Typography>
      <Typography tone="secondary" variant="body2" style={styles.description}>
        Custom player with Skia controls for a YouTube link.
      </Typography>
      <View style={styles.playerWrap}>
        <SkiaVideoPlayer youtubeUrl={DEMO_YOUTUBE_URL} />
      </View>
    </ScrollView>
  );
}

/** @param {import('../../../theme/palettes').ThemeColors} _colors */
const createStyles = _colors =>
  StyleSheet.create({
    content: {
      paddingTop: 24,
      paddingBottom: 32,
      gap: 8,
    },
    description: {
      marginBottom: 16,
    },
    playerWrap: {
      width: '100%',
    },
  });
