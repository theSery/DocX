import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Canvas,
  Circle,
  dist,
  Image,
  ImageShader,
  makeImageFromView,
  mix,
  vec,
} from '@shopify/react-native-skia';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { Appearance, Dimensions, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { ColorScheme, isColorScheme } from './constants';
import { getPalette, lightColors } from './palettes';

const TRANSITION_MS = 650;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/** Wait N animation frames so React/Skia can commit before the next step. */
const waitFrames = (n = 1) =>
  new Promise(resolve => {
    let remaining = n;
    const tick = () => {
      remaining -= 1;
      if (remaining <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

// Android needs extra settle time or the new theme flashes through before
// the Skia overlay has painted (same race as circular-reveal theme libs).
const SETTLE = {
  // Extra frames on Android: Skia paint + React commit often lose the race
  // against the under-overlay color swap (instant flash, then reveal).
  skiaPaint: Platform.OS === 'android' ? 3 : 1,
  treeRepaint: Platform.OS === 'android' ? 2 : 1,
};

// iOS paints overlay2's Circle in the same commit it mounts. If `transition`
// is still 1 from a previous reveal, the circle appears at full radius first
// (instant theme swap), then the animation runs. Zero the radius before mount
// and give Skia a couple of frames to paint the clipped circle at r=0.
const IOS_OVERLAY2_SETTLE_FRAMES = 3;

const getSystemScheme = () =>
  Appearance.getColorScheme() === ColorScheme.DARK ? ColorScheme.DARK : ColorScheme.LIGHT;

const defaultSystemScheme = getSystemScheme();

const defaultContextValue = {
  active: false,
  statusBarStyle: defaultSystemScheme === ColorScheme.LIGHT ? 'dark' : 'light',
  colorScheme: defaultSystemScheme,
  overlay1: null,
  overlay2: null,
};

const ColorSchemeContext = createContext(null);

const colorSchemeReducer = (_, nextState) => nextState;

const { width, height } = Dimensions.get('screen');
const corners = [vec(0, 0), vec(width, 0), vec(width, height), vec(0, height)];

function buildState({ colorScheme, active = false, overlay1 = null, overlay2 = null }) {
  return {
    active,
    colorScheme,
    overlay1,
    overlay2,
    statusBarStyle: colorScheme === ColorScheme.LIGHT ? 'dark' : 'light',
  };
}

export function useColorSchemeContext() {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) {
    throw new Error('useColorSchemeContext must be used inside ColorSchemeProvider.');
  }

  const {
    colorScheme,
    dispatch,
    ref,
    transition,
    circle,
    active,
    colors,
    isLightModeLocked,
  } = ctx;

  // Synchronous lock so rapid taps can't start overlapping transitions
  // before React re-renders `active` (same guard as the example's `!active`).
  const transitionLockRef = useRef(false);

  const setColorScheme = useCallback(
    async (nextScheme, x, y) => {
      if (
        transitionLockRef.current ||
        active ||
        !isColorScheme(nextScheme) ||
        nextScheme === colorScheme
      ) {
        return;
      }

      transitionLockRef.current = true;

      // Keep status bar contrast for the *current* UI under the overlay
      // (same as the example: statusBarStyle tracks the incoming scheme name).
      const transitionStatusBarStyle = nextScheme;
      const previousScheme = colorScheme;

      try {
        dispatch({
          ...buildState({ colorScheme: previousScheme, active: true }),
          statusBarStyle: transitionStatusBarStyle,
        });

        const r = Math.max(...corners.map(corner => dist(corner, { x, y })));
        circle.value = { x, y, r };
        // iOS: zero before overlay2 mounts so the Circle never paints at full r.
        if (Platform.OS === 'ios') {
          transition.value = 0;
        }

        // 1. Snapshot the current (old) theme
        const overlay1 = await makeImageFromView(ref);
        dispatch({
          ...buildState({ colorScheme: previousScheme, active: true }),
          overlay1,
          overlay2: null,
          statusBarStyle: transitionStatusBarStyle,
        });

        // 2. Let Skia paint the opaque overlay before swapping colors underneath.
        //    Without this, Android flashes the new theme through the Canvas.
        await waitFrames(SETTLE.skiaPaint);

        // 3. Swap theme under the overlay (invisible to the user)
        dispatch({
          ...buildState({ colorScheme: nextScheme, active: true }),
          overlay1,
          overlay2: null,
          statusBarStyle: transitionStatusBarStyle,
        });

        // 4. Let the new theme commit, then snapshot it for the reveal
        await waitFrames(SETTLE.treeRepaint);
        const overlay2 = await makeImageFromView(ref);

        if (Platform.OS === 'ios') {
          // Must zero before overlay2 mounts: iOS draws the Circle in the same
          // frame it appears. Leaving transition at 1 shows the full new theme
          // instantly, then the reveal animation starts afterward.
          transition.value = 0;
          dispatch({
            ...buildState({ colorScheme: nextScheme, active: true }),
            overlay1,
            overlay2,
            statusBarStyle: transitionStatusBarStyle,
          });
          await waitFrames(IOS_OVERLAY2_SETTLE_FRAMES);
          transition.value = withTiming(1, { duration: TRANSITION_MS });
        } else {
          dispatch({
            ...buildState({ colorScheme: nextScheme, active: true }),
            overlay1,
            overlay2,
            statusBarStyle: transitionStatusBarStyle,
          });

          // Let overlay2 mount on the Canvas before the circle starts growing
          await waitFrames(SETTLE.skiaPaint);

          // 5. Circular reveal from the tap point
          transition.value = 0;
          transition.value = withTiming(1, { duration: TRANSITION_MS });
        }
        await wait(TRANSITION_MS);
        dispatch(buildState({ colorScheme: nextScheme }));
        await AsyncStorage.setItem(STORAGE_KEYS.COLOR_SCHEME, nextScheme);
      } catch {
        dispatch(buildState({ colorScheme: previousScheme }));
      } finally {
        transitionLockRef.current = false;
      }
    },
    [active, circle, colorScheme, dispatch, ref, transition],
  );

  return {
    colorScheme,
    isDarkMode: isLightModeLocked ? false : colorScheme === ColorScheme.DARK,
    isLightModeLocked: Boolean(isLightModeLocked),
    isAnimating: active,
    active,
    colors,
    setColorScheme,
  };
}

/**
 * Forces light palette for auth/onboarding while preserving the user's global scheme preference.
 */
export function LightThemeScope({ children }) {
  const parent = useContext(ColorSchemeContext);
  if (!parent) {
    throw new Error('LightThemeScope must be used inside ColorSchemeProvider.');
  }

  const value = useMemo(
    () => ({
      ...parent,
      colors: lightColors,
      isLightModeLocked: true,
    }),
    [parent],
  );

  return (
    <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>
  );
}

export function ColorSchemeProvider({ children }) {
  const circle = useSharedValue({ x: 0, y: 0, r: 0 });
  const transition = useSharedValue(0);
  const ref = useRef(null);
  const hasHydratedRef = useRef(false);
  const statusBarBackgroundRef = useRef(getPalette(defaultSystemScheme).background);
  const [{ colorScheme, overlay1, overlay2, active, statusBarStyle }, dispatch] = useReducer(
    colorSchemeReducer,
    defaultContextValue,
  );
  const revealRadius = useDerivedValue(() => mix(transition.value, 0, circle.value.r));
  const colors = useMemo(() => getPalette(colorScheme), [colorScheme]);

  // Keep Android DayNight dialogs (e.g. DateTimePicker) in sync with the
  // in-app scheme. Activity is not recreated because uiMode is in configChanges.
  useEffect(() => {
    Appearance.setColorScheme(colorScheme);
  }, [colorScheme]);

  // Freeze Android status-bar chrome while overlays cover the UI, otherwise
  // StatusBar.backgroundColor jumps with the under-overlay theme swap.
  useEffect(() => {
    if (!active) {
      statusBarBackgroundRef.current = colors.background;
    }
  }, [active, colors.background]);

  const statusBarBackground = active ? statusBarBackgroundRef.current : colors.background;

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEYS.COLOR_SCHEME).then(stored => {
      if (cancelled || hasHydratedRef.current) {
        return;
      }
      hasHydratedRef.current = true;

      // First launch (or legacy "system"): seed from OS appearance, then persist light/dark.
      const scheme = isColorScheme(stored) ? stored : getSystemScheme();
      if (stored !== scheme) {
        AsyncStorage.setItem(STORAGE_KEYS.COLOR_SCHEME, scheme);
      }

      dispatch(buildState({ colorScheme: scheme }));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      active,
      colorScheme,
      overlay1,
      overlay2,
      dispatch,
      ref,
      transition,
      circle,
      statusBarStyle,
      colors,
    }),
    [active, circle, colorScheme, colors, overlay1, overlay2, statusBarStyle, transition],
  );

  return (
    <View style={styles.fill}>
      <StatusBar
        barStyle={statusBarStyle === 'light' ? 'light-content' : 'dark-content'}
        backgroundColor={statusBarBackground}
      />
      <View ref={ref} style={styles.fill} collapsable={false}>
        <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>
      </View>
      <Canvas style={styles.overlay} pointerEvents="none">
        <Image image={overlay1} x={0} y={0} width={width} height={height} />
        {overlay2 ? (
          <Circle c={circle} r={revealRadius}>
            <ImageShader image={overlay2} x={0} y={0} width={width} height={height} fit="cover" />
          </Circle>
        ) : null}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // elevation keeps the overlay above Android views that use elevation
  // (tab bar, screens) — otherwise the live theme swap shows through.
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    elevation: 1000,
  },
});
