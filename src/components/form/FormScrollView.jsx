import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FlatList, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { FormScrollContext, useFormScrollController } from './formKeyboard';

const DEFAULT_SCROLL_PROPS = {
  keyboardShouldPersistTaps: 'handled',
  keyboardDismissMode: 'on-drag',
  // Keep iOS inset behavior; Android is handled via outer inset + ensure-visible.
  automaticallyAdjustKeyboardInsets: Platform.OS === 'ios',
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

function useMergedScrollRef(forwardedRef) {
  const innerRef = useRef(null);

  useImperativeHandle(forwardedRef, () => innerRef.current);

  return innerRef;
}

function useAndroidFormKeyboard(scrollToY, onScroll) {
  const [keyboardInset, setKeyboardInset] = useState(0);
  const pendingEnsureRef = useRef(false);

  const onKeyboardInsetChange = useCallback(inset => {
    setKeyboardInset(inset > 0 ? inset : 0);
    if (inset > 0) {
      pendingEnsureRef.current = true;
    }
  }, []);

  const controller = useFormScrollController({
    scrollToY,
    onKeyboardInsetChange,
  });

  useEffect(() => {
    if (Platform.OS !== 'android' || !pendingEnsureRef.current || keyboardInset <= 0) {
      return undefined;
    }

    pendingEnsureRef.current = false;
    const timer = setTimeout(() => {
      controller.ensureFocusedVisible?.();
    }, 48);

    return () => clearTimeout(timer);
  }, [keyboardInset, controller]);

  const handleScroll = useCallback(
    event => {
      controller.onScrollOffsetChange(event.nativeEvent.contentOffset.y);
      onScroll?.(event);
    },
    [controller, onScroll],
  );

  const isKeyboardOpen = Platform.OS === 'android' && keyboardInset > 0;

  const wrapperStyle = useMemo(
    () => (isKeyboardOpen ? [styles.fill, { paddingBottom: keyboardInset + 50, marginTop: -10 }] : styles.fill),
    [isKeyboardOpen, keyboardInset],
  );

  return { controller, handleScroll, wrapperStyle, isKeyboardOpen };
}

/**
 * Drop-in ScrollView for forms. On Android, insets the scroll viewport above
 * the keyboard when the window does not resize, then scrolls the focused field
 * into view with a small gap.
 *
 * When the keyboard is open, any floating tab-bar `marginBottom` on `style` is cleared
 * so tab-bar spacing does not stack on top of the keyboard inset.
 */
export const FormScrollView = forwardRef(function FormScrollView(
  { children, onScroll, scrollEventThrottle = 16, style, ...rest },
  ref,
) {
  const scrollRef = useMergedScrollRef(ref);

  const scrollToY = useCallback(
    y => {
      scrollRef.current?.scrollTo?.({ y, animated: true });
    },
    [scrollRef],
  );

  const { controller, handleScroll, wrapperStyle, isKeyboardOpen } =
    useAndroidFormKeyboard(scrollToY, onScroll);

  const scrollStyle = useMemo(
    () => [styles.fill, style, isKeyboardOpen ? { marginBottom: 0 } : null],
    [style, isKeyboardOpen],
  );

  return (
    <FormScrollContext.Provider value={controller}>
      <View style={wrapperStyle}>
        <ScrollView
          ref={scrollRef}
          {...DEFAULT_SCROLL_PROPS}
          {...rest}
          style={scrollStyle}
          onScroll={handleScroll}
          scrollEventThrottle={scrollEventThrottle}
        >
          {children}
        </ScrollView>
      </View>
    </FormScrollContext.Provider>
  );
});

/**
 * Drop-in FlatList for multi-step / long forms with the same keyboard behavior.
 */
export const FormFlatList = forwardRef(function FormFlatList(
  { onScroll, scrollEventThrottle = 16, style, ...rest },
  ref,
) {
  const listRef = useMergedScrollRef(ref);

  const scrollToY = useCallback(
    y => {
      listRef.current?.scrollToOffset?.({ offset: y, animated: true });
    },
    [listRef],
  );

  const { controller, handleScroll, wrapperStyle, isKeyboardOpen } =
    useAndroidFormKeyboard(scrollToY, onScroll);

  const listStyle = useMemo(
    () => [styles.fill, style, isKeyboardOpen ? { marginBottom: 0 } : null],
    [style, isKeyboardOpen],
  );

  return (
    <FormScrollContext.Provider value={controller}>
      <View style={wrapperStyle}>
        <FlatList
          ref={listRef}
          {...DEFAULT_SCROLL_PROPS}
          {...rest}
          style={listStyle}
          onScroll={handleScroll}
          scrollEventThrottle={scrollEventThrottle}
        />
      </View>
    </FormScrollContext.Provider>
  );
});
