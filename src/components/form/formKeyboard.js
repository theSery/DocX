import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Dimensions, Keyboard, Platform } from 'react-native';

/** Vertical gap between the focused input bottom and the keyboard top. */
export const KEYBOARD_INPUT_GAP = 10;

const ANDROID_ENSURE_DELAY_MS = 64;
const FOCUS_ENSURE_DELAY_MS = 100;
const RETRY_ENSURE_DELAY_MS = 180;

export const FormScrollContext = createContext(null);

/**
 * Latest keyboard frame. `screenY` is the top edge of the keyboard in the same
 * coordinate space as `measureInWindow`.
 */
let latestKeyboardTop = null;
let latestKeyboardHeight = 0;

function readKeyboardFrame(event) {
  const end = event?.endCoordinates;
  if (!end) {
    return { keyboardTop: null, keyboardHeight: 0 };
  }
  return {
    keyboardTop: typeof end.screenY === 'number' ? end.screenY : null,
    keyboardHeight: typeof end.height === 'number' ? end.height : 0,
  };
}

/**
 * When Android does not actually resize the window (`adjustResize` noop /
 * edge-to-edge), the keyboard overlays content and we must inset manually.
 * If the window bottom already sits on the keyboard top, resize is working.
 */
export function getAndroidKeyboardOverlayInset(keyboardTop, keyboardHeight) {
  if (keyboardTop == null || keyboardHeight <= 0) {
    return 0;
  }
  const windowHeight = Dimensions.get('window').height;
  const windowAlreadyResized = keyboardTop >= windowHeight - 8;
  return windowAlreadyResized ? 0 : keyboardHeight;
}

/**
 * Scrolls `targetRef` so its bottom sits ~KEYBOARD_INPUT_GAP above the keyboard.
 */
export function ensureInputVisibleAboveKeyboard(
  targetRef,
  { scrollBy, keyboardTop, allowRetry = true } = {},
) {
  if (Platform.OS !== 'android' || !targetRef?.current || !scrollBy) {
    return;
  }

  const resolvedKeyboardTop =
    typeof keyboardTop === 'number' ? keyboardTop : latestKeyboardTop;

  if (resolvedKeyboardTop == null) {
    return;
  }

  const node = targetRef.current;
  if (typeof node.measureInWindow !== 'function') {
    return;
  }

  node.measureInWindow((_x, y, _width, height) => {
    if (y == null || height == null) {
      return;
    }

    const visibleBottom = resolvedKeyboardTop - KEYBOARD_INPUT_GAP;
    const overlap = y + height - visibleBottom;

    if (overlap <= 1) {
      return;
    }

    scrollBy(overlap);

    if (allowRetry) {
      setTimeout(() => {
        ensureInputVisibleAboveKeyboard(targetRef, {
          scrollBy,
          keyboardTop: resolvedKeyboardTop,
          allowRetry: false,
        });
      }, RETRY_ENSURE_DELAY_MS);
    }
  });
}

/**
 * Shared keyboard + scroll wiring for ScrollView / FlatList form containers.
 */
export function useFormScrollController({ scrollToY, onKeyboardInsetChange }) {
  const scrollYRef = useRef(0);
  const focusedTargetRef = useRef(null);
  const ensureTimeoutRef = useRef(null);

  const clearEnsureTimeout = useCallback(() => {
    if (ensureTimeoutRef.current != null) {
      clearTimeout(ensureTimeoutRef.current);
      ensureTimeoutRef.current = null;
    }
  }, []);

  const scrollBy = useCallback(
    deltaY => {
      if (!deltaY || typeof scrollToY !== 'function') {
        return;
      }
      const nextY = Math.max(0, scrollYRef.current + deltaY);
      scrollYRef.current = nextY;
      scrollToY(nextY);
    },
    [scrollToY],
  );

  const runEnsureVisible = useCallback(
    targetRef => {
      ensureInputVisibleAboveKeyboard(targetRef, {
        scrollBy,
        keyboardTop: latestKeyboardTop,
      });
    },
    [scrollBy],
  );

  const scheduleEnsureVisible = useCallback(
    (targetRef, delayMs = ANDROID_ENSURE_DELAY_MS) => {
      if (Platform.OS !== 'android' || !targetRef) {
        return;
      }
      clearEnsureTimeout();
      ensureTimeoutRef.current = setTimeout(() => {
        ensureTimeoutRef.current = null;
        runEnsureVisible(targetRef);
      }, delayMs);
    },
    [clearEnsureTimeout, runEnsureVisible],
  );

  const ensureVisible = useCallback(
    targetRef => {
      if (Platform.OS !== 'android' || !targetRef) {
        return;
      }
      focusedTargetRef.current = targetRef;
      if (latestKeyboardTop != null) {
        scheduleEnsureVisible(targetRef, FOCUS_ENSURE_DELAY_MS);
      }
    },
    [scheduleEnsureVisible],
  );

  const ensureFocusedVisible = useCallback(() => {
    if (focusedTargetRef.current) {
      scheduleEnsureVisible(focusedTargetRef.current, ANDROID_ENSURE_DELAY_MS);
    }
  }, [scheduleEnsureVisible]);

  const clearFocusedTarget = useCallback(
    targetRef => {
      if (focusedTargetRef.current === targetRef) {
        focusedTargetRef.current = null;
        clearEnsureTimeout();
      }
    },
    [clearEnsureTimeout],
  );

  const onScrollOffsetChange = useCallback(offsetY => {
    scrollYRef.current = offsetY;
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const handleShow = event => {
      const { keyboardTop, keyboardHeight } = readKeyboardFrame(event);
      latestKeyboardTop = keyboardTop;
      latestKeyboardHeight = keyboardHeight;

      const inset = getAndroidKeyboardOverlayInset(keyboardTop, keyboardHeight);
      onKeyboardInsetChange?.(inset);

      if (focusedTargetRef.current) {
        // Let the outer inset apply first, then scroll the focused field.
        scheduleEnsureVisible(focusedTargetRef.current, ANDROID_ENSURE_DELAY_MS + 50);
      }
    };

    const handleHide = () => {
      latestKeyboardTop = null;
      latestKeyboardHeight = 0;
      onKeyboardInsetChange?.(0);
      clearEnsureTimeout();
    };

    const showSub = Keyboard.addListener('keyboardDidShow', handleShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', handleHide);

    if (latestKeyboardHeight > 0) {
      onKeyboardInsetChange?.(
        getAndroidKeyboardOverlayInset(latestKeyboardTop, latestKeyboardHeight),
      );
    }

    return () => {
      showSub.remove();
      hideSub.remove();
      clearEnsureTimeout();
    };
  }, [clearEnsureTimeout, onKeyboardInsetChange, scheduleEnsureVisible]);

  return useMemo(
    () => ({
      ensureVisible,
      ensureFocusedVisible,
      clearFocusedTarget,
      onScrollOffsetChange,
    }),
    [ensureVisible, ensureFocusedVisible, clearFocusedTarget, onScrollOffsetChange],
  );
}

/**
 * Hook for form inputs: on focus, ask the nearest FormScrollView to keep this
 * field ~10px above the keyboard (Android).
 */
export function useEnsureInputVisible(targetRef) {
  const scroll = useContext(FormScrollContext);

  const handleFocus = useCallback(() => {
    scroll?.ensureVisible?.(targetRef);
  }, [scroll, targetRef]);

  const handleBlur = useCallback(() => {
    scroll?.clearFocusedTarget?.(targetRef);
  }, [scroll, targetRef]);

  return {
    onInputFocus: handleFocus,
    onInputBlur: handleBlur,
  };
}
