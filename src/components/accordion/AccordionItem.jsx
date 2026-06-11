import { memo, useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  scrollTo,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import Chevron from '../icons/Chevron';
import { useTheme } from '../../hooks/useTheme';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const EXPAND_EASING = Easing.bezier(0.33, 0.01, 0, 1);

/**
 * Single accordion row. Header is always visible; content height is animated
 * on the UI thread between 0 and its measured natural height.
 *
 * The content is rendered inside an absolutely-positioned wrapper so it can be
 * measured at its natural size without affecting layout while collapsed.
 *
 * @param {{
 *   itemKey: string | number;
 *   index: number;
 *   isOpen: boolean;
 *   onToggle: (key: string | number, index: number) => void;
 *   header: React.ReactNode;
 *   children: React.ReactNode;
 *   duration: number;
 *   openingIndex: import('react-native-reanimated').SharedValue<number>;
 *   scrollRef?: import('react-native-reanimated').AnimatedRef<any>;
 *   scrollOffset?: import('react-native-reanimated').SharedValue<number>;
 *   style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 *   contentStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 * }} props
 */
function AccordionItemComponent({
  itemKey,
  index,
  isOpen,
  onToggle,
  header,
  children,
  duration,
  openingIndex,
  scrollRef,
  scrollOffset,
  style,
  contentStyle,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const contentHeight = useSharedValue(0);
  const progress = useSharedValue(isOpen ? 1 : 0);

  // Scroll compensation state: keeps the newly opened item visually anchored
  // while this (open) item collapses above it.
  const compensationBase = useSharedValue(0);
  const compensationStart = useSharedValue(1);
  const isCompensating = useSharedValue(false);

  const hasScrollSync = scrollRef != null && scrollOffset != null;

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, {
      duration,
      easing: EXPAND_EASING,
    });
  }, [duration, isOpen, progress]);

  useAnimatedReaction(
    () => progress.value,
    (current, previous) => {
      if (!hasScrollSync || previous == null || current >= previous) {
        isCompensating.value = false;
        return;
      }

      // Compensate only while this item collapses ABOVE the item being opened,
      // otherwise the layout shift does not move the opened item.
      if (openingIndex.value <= index) {
        isCompensating.value = false;
        return;
      }

      if (!isCompensating.value) {
        isCompensating.value = true;
        compensationBase.value = scrollOffset.value;
        compensationStart.value = previous;
      }

      const collapsedBy =
        (compensationStart.value - current) * contentHeight.value;
      scrollTo(
        scrollRef,
        0,
        Math.max(0, compensationBase.value - collapsedBy),
        false,
      );
    },
    [hasScrollSync, index, scrollRef, scrollOffset],
  );

  const handleContentLayout = useCallback(
    event => {
      const { height } = event.nativeEvent.layout;
      if (height !== contentHeight.value) {
        contentHeight.value = height;
      }
    },
    [contentHeight],
  );

  const handlePress = useCallback(() => {
    onToggle(itemKey, index);
  }, [index, itemKey, onToggle]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: contentHeight.value * progress.value,
    opacity: interpolate(progress.value, [0, 0.4, 1], [0, 0.4, 1]),
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  return (
    <View style={[styles.item, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={handlePress}
        style={styles.header}
      >
        <View style={styles.headerContent}>{header}</View>
        <Animated.View style={[styles.chevronWrap, chevronStyle]}>
          <Chevron width={20} height={20} fill={colors.iconAccent} rotate={90} />
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.body, bodyStyle]}>
        <View style={styles.bodyInner} onLayout={handleContentLayout}>
          <View style={[styles.content, contentStyle]}>{children}</View>
        </View>
      </Animated.View>
    </View>
  );
}

export const AccordionItem = memo(AccordionItemComponent);

const createStyles = colors =>
  StyleSheet.create({
    item: {
      borderRadius: 24,
      backgroundColor: colors.pureWhite,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      marginBottom: 10,
      paddingHorizontal: 8,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    chevronWrap: {
      marginHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      overflow: 'hidden',
    },
    bodyInner: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    content: {
      paddingHorizontal: 8,
      paddingTop: 2,
      paddingBottom: 14,
    },
  });
