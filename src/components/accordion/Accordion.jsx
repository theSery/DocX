import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { runOnUI, scrollTo, useSharedValue } from 'react-native-reanimated';

import { AccordionItem } from './AccordionItem';
import { AnimatedView } from '../animation/AnimatedView';
import {
  STAGGERED_ENTER,
  getStaggeredEnterConfig,
} from '../animation/staggeredEnterAnimation';
import { Typography } from '../typography/Typography';

const DEFAULT_DURATION = 320;
const SCROLL_INTO_VIEW_DELAY_MS = 32;

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
 *   openKey?: string | number | null;
 *   onOpenChange?: (key: string | number | null) => void;
 *   openRequestId?: string | number | null;
 *   scrollRef?: import('react-native-reanimated').AnimatedRef<any>;
 *   scrollOffset?: import('react-native-reanimated').SharedValue<number>;
 *   scrollIntoViewOffset?: number;
 *   style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 *   itemStyle?:
 *     | import('react-native').StyleProp<import('react-native').ViewStyle>
 *     | ((item: object, state: { isOpen: boolean }) => import('react-native').StyleProp<import('react-native').ViewStyle>);
 *   headerStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>;
 *   contentStyle?:
 *     | import('react-native').StyleProp<import('react-native').ViewStyle>
 *     | ((item: object, state: { isOpen: boolean }) => import('react-native').StyleProp<import('react-native').ViewStyle>);
 *   staggeredEnter?: boolean;
 *   itemAnimation?: string | import('react-native-reanimated').IEntryExitAnimationBuilder;
 *   itemAnimationConfig?: object | ((item: object, index: number) => object);
 *   showFavorite?: boolean;
 *   onFavoritePress?: (item: object) => void;
 * }} props
 */
export function Accordion({
  items,
  keyExtractor = defaultKeyExtractor,
  renderHeader,
  renderContent,
  duration = DEFAULT_DURATION,
  initialOpenKey = null,
  openKey: controlledOpenKey,
  onOpenChange,
  openRequestId = null,
  scrollRef,
  scrollOffset,
  scrollIntoViewOffset = 0,
  style,
  itemStyle,
  headerStyle,
  contentStyle,
  staggeredEnter = false,
  itemAnimation,
  itemAnimationConfig,
  showFavorite = false,
  onFavoritePress,
}) {
  const isControlled = controlledOpenKey !== undefined;
  const [openKey, setOpenKey] = useState(
    isControlled ? controlledOpenKey : initialOpenKey,
  );
  const openKeyRef = useRef(isControlled ? controlledOpenKey : initialOpenKey);
  // Index of the item currently opening (-1 when none). Read on the UI thread
  // by closing items to decide whether scroll compensation is needed.
  const openingIndex = useSharedValue(-1);
  const itemOffsetsRef = useRef({});
  const [offsetVersion, setOffsetVersion] = useState(0);
  const lastScrolledRequestRef = useRef(null);

  const handleToggle = useCallback(
    (key, index) => {
      const nextKey = openKeyRef.current === key ? null : key;
      openKeyRef.current = nextKey;
      openingIndex.value = nextKey === null ? -1 : index;
      if (!isControlled) {
        setOpenKey(nextKey);
      }
      onOpenChange?.(nextKey);
    },
    [isControlled, onOpenChange, openingIndex],
  );

  const handleItemLayout = useCallback((key, y) => {
    if (itemOffsetsRef.current[key] === y) {
      return;
    }
    itemOffsetsRef.current[key] = y;
    setOffsetVersion(version => version + 1);
  }, []);

  const syncOpenKey = useCallback(
    nextKey => {
      const index =
        nextKey == null
          ? -1
          : items?.findIndex((item, i) => keyExtractor(item, i) === nextKey) ??
            -1;
      openKeyRef.current = nextKey;
      openingIndex.value = index;
      setOpenKey(nextKey);
    },
    [items, keyExtractor, openingIndex],
  );

  // Search (and similar) can request a specific open item while this screen is
  // already mounted; sync open state without relying on remount.
  useEffect(() => {
    if (isControlled || initialOpenKey == null) {
      return;
    }

    syncOpenKey(initialOpenKey);
  }, [initialOpenKey, isControlled, openRequestId, syncOpenKey]);

  // Parents (dropdowns, search) can force open/close while this screen is mounted.
  useEffect(() => {
    if (!isControlled) {
      return;
    }

    syncOpenKey(controlledOpenKey);
  }, [controlledOpenKey, isControlled, syncOpenKey]);

  // Bring the search-selected item into view once per open request.
  useEffect(() => {
    if (
      initialOpenKey == null ||
      openRequestId == null ||
      scrollRef == null ||
      lastScrolledRequestRef.current === openRequestId
    ) {
      return;
    }

    const itemY = itemOffsetsRef.current[initialOpenKey];
    if (typeof itemY !== 'number') {
      return;
    }

    const targetY = Math.max(0, itemY + scrollIntoViewOffset);
    const timer = setTimeout(() => {
      lastScrolledRequestRef.current = openRequestId;
      runOnUI(y => {
        'worklet';
        scrollTo(scrollRef, 0, y, true);
      })(targetY);
    }, SCROLL_INTO_VIEW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [
    initialOpenKey,
    offsetVersion,
    openRequestId,
    scrollIntoViewOffset,
    scrollRef,
  ]);

  return (
    <View style={style}>
      {items?.map((item, index) => {
        const key = keyExtractor(item, index);
        const isOpen = openKey === key;

        const accordionItem = (
          <AccordionItem
            itemKey={key}
            index={index}
            isOpen={isOpen}
            onToggle={handleToggle}
            duration={duration}
            openingIndex={openingIndex}
            scrollRef={scrollRef}
            scrollOffset={scrollOffset}
            showFavorite={showFavorite}
            isFavorite={Boolean(item?.favorite)}
            onFavoritePress={
              onFavoritePress ? () => onFavoritePress(item) : undefined
            }
            style={
              typeof itemStyle === 'function'
                ? itemStyle(item, { isOpen })
                : itemStyle
            }
            headerStyle={headerStyle}
            contentStyle={
              typeof contentStyle === 'function'
                ? contentStyle(item, { isOpen })
                : contentStyle
            }
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

        const onItemLayout = event => {
          handleItemLayout(key, event.nativeEvent.layout.y);
        };

        if (!resolvedAnimation) {
          return (
            <View key={key} onLayout={onItemLayout}>
              {accordionItem}
            </View>
          );
        }

 
        return (
          <View
            key={key}
            // animation={resolvedAnimation}
            // animationConfig={animationConfig}
            // onLayout={onItemLayout}
          >
            {accordionItem}
          </View>
        );
      })}
    </View>
  );
}
