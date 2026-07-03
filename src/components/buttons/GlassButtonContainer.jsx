import { Pressable, StyleSheet, View } from 'react-native';

import { GlassSurface } from '../glass/GlassSurface';
import { colors, palette } from '../../theme';

export function GlassButtonContainer({
  children,
  onPress,
  height = 44,
  width,
  style,
  ...pressableProps
}) {
  const buttonWidth = width ?? height;
  const borderRadius = height / 2;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pressable,
        { width: buttonWidth, height, borderRadius },
        style,
      ]}
      {...pressableProps}>
      <GlassSurface
        gradientId="glassButtonSheen"
        borderRadius={borderRadius}
        style={styles.surface}
      />
      <View style={styles.content}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  surface: {
    ...StyleSheet.absoluteFillObject,
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
