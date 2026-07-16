import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { AccordionItem } from './AccordionItem';
import { AnimatedView } from '../animation/AnimatedView';
import {
  STAGGERED_ENTER,
  getStaggeredEnterConfig,
} from '../animation/staggeredEnterAnimation';
import { Typography } from '../typography/Typography';

const DEFAULT_DURATION = 320;

function defaultKeyExtractor(item, index) {
  return item?.id ?? index;
}

/**
 * Single-open accordion list animated with Reanimated on the UI thread.
 *
 * - Only one item can be open at a time; opening a new item smoothly closes
 *   the previous one.
 * - When `scrollRef` + `scrollOffset` are provided, the scroll position is
 *   compensated frame-by-frame so the newly opened item is not pushed around
 *   by the item collapsing above it.
 *
 * @example
 * const scrollRef = useAnimatedRef();
 * const scrollY = useSharedValue(0); // kept in sync by your scroll handler
 *
 * <Accordion
 *   items={faqItems} // [{ id, title, content }]
 *   scrollRef={scrollRef}
 *   scrollOffset={scrollY}
 * />
 *
 * @param {{
 *   items: Array<object>;
 *   keyExtractor?: (item: object, index: number) => string | number;
 *   renderHeader?: (item: object, state: { isOpen: boolean }) => React.ReactNode;
 *   renderContent?: (item: object) => React.ReactNode;
 *   duration?: number;
 *   initialOpenKey?: string | number | null;
 *   scrollRef?: import('react-native-reanimated').AnimatedRef<any>;
 *   scrollOffset?: import('react-native-reanimated').SharedValue<number>;
 *   style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 *   itemStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 *   contentStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 *   staggeredEnter?: boolean;
 *   itemAnimation?: string | import('react-native-reanimated').IEntryExitAnimationBuilder;
 *   itemAnimationConfig?: object | ((item: object, index: number) => object);
 * }} props
 */
export function Accordion({
  items,
  keyExtractor = defaultKeyExtractor,
  renderHeader,
  renderContent,
  duration = DEFAULT_DURATION,
  initialOpenKey = null,
  scrollRef,
  scrollOffset,
  style,
  itemStyle,
  contentStyle,
  staggeredEnter = false,
  itemAnimation,
  itemAnimationConfig,
}) {
  const [openKey, setOpenKey] = useState(initialOpenKey);
  const openKeyRef = useRef(initialOpenKey);
  // Index of the item currently opening (-1 when none). Read on the UI thread
  // by closing items to decide whether scroll compensation is needed.
  const openingIndex = useSharedValue(-1);

  const handleToggle = useCallback(
    (key, index) => {
      const nextKey = openKeyRef.current === key ? null : key;
      openKeyRef.current = nextKey;
      openingIndex.value = nextKey === null ? -1 : index;
      setOpenKey(nextKey);
    },
    [openingIndex],
  );

  return (
    <View style={style}>
      {items?.map((item, index) => {
        const key = keyExtractor(item, index);
        const isOpen = openKey === key;

        const accordionItem = (
          <AccordionItem
            key={key}
            itemKey={key}
            index={index}
            isOpen={isOpen}
            onToggle={handleToggle}
            duration={duration}
            openingIndex={openingIndex}
            scrollRef={scrollRef}
            scrollOffset={scrollOffset}
            style={itemStyle}
            contentStyle={contentStyle}
            header={
              renderHeader ? (
                renderHeader(item, { isOpen })
              ) : (
                <Typography variant="h5">{item?.title}</Typography>
              )
            }
          >
            {renderContent ? (
              renderContent(item)
            ) : (
              <Typography variant="h5" tone="secondary">
                {item?.content}
              </Typography>
            )}
          </AccordionItem>
        );

        const resolvedAnimation =
          itemAnimation ?? (staggeredEnter ? STAGGERED_ENTER.animation : null);

        if (!resolvedAnimation) {
          return accordionItem;
        }

        const animationConfig = itemAnimationConfig
          ? typeof itemAnimationConfig === 'function'
            ? itemAnimationConfig(item, index)
            : itemAnimationConfig
          : staggeredEnter
            ? getStaggeredEnterConfig(index)
            : undefined;

        return (
          <AnimatedView
            key={key}
            animation={resolvedAnimation}
            animationConfig={animationConfig}
          >
            {accordionItem}
          </AnimatedView>
        );
      })}
    </View>
  );
}
