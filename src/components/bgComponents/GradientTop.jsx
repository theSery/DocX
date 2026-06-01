import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { colors } from '../../theme';
import { AUTH_SCREEN_HORIZONTAL_PADDING } from '../layout';
import { HEIGHT, WIDTH } from '../../utils/dimensions';


export function GradientTop({ children }) {
  const WHITE_CONTENT_HEIGHT = HEIGHT;
  const ARC_RADIUS = 24;

  const skiaPath = React.useMemo(() => {
    const path = Skia.Path.Make();
    path.moveTo(0, 0);
    path.quadTo(0, ARC_RADIUS, ARC_RADIUS, ARC_RADIUS);
    path.lineTo(WIDTH - ARC_RADIUS, ARC_RADIUS);
    path.quadTo(WIDTH, ARC_RADIUS, WIDTH, 0);
    path.lineTo(WIDTH, WHITE_CONTENT_HEIGHT + ARC_RADIUS);
    path.lineTo(0, WHITE_CONTENT_HEIGHT + ARC_RADIUS);
    path.close();
    return path;
  }, [WHITE_CONTENT_HEIGHT]);

  return (
    <View style={styles.container}>
      <Canvas style={[StyleSheet.absoluteFill]}>
        <Path path={skiaPath} color={colors.background} />
      </Canvas>
{children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    marginHorizontal: -AUTH_SCREEN_HORIZONTAL_PADDING,
  },
});

GradientTop;
