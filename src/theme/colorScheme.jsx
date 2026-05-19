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
import { Appearance, Dimensions, StatusBar, StyleSheet, View } from 'react-native';
import { useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { ColorScheme, isColorScheme } from './constants';
import { getPalette, lightColors } from './palettes';

const TRANSITION_MS = 650;
const FRAME_MS = 16;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const getSystemScheme = () =>
  Appearance.getColorScheme() === ColorScheme.DARK ? ColorScheme.DARK : ColorScheme.LIGHT;

const defaultScheme = getSystemScheme();

const defaultContextValue = {
  active: false,
  statusBarStyle: defaultScheme === ColorScheme.LIGHT ? 'dark' : 'light',
  colorScheme: defaultScheme,
  overlay1: null,
  overlay2: null,
};

const ColorSchemeContext = createContext(null);

const colorSchemeReducer = (_, colorScheme) => colorScheme;

const { width, height } = Dimensions.get('screen');
const corners = [vec(0, 0), vec(width, 0), vec(width, height), vec(0, height)];

function buildState(scheme, { active = false, overlay1 = null, overlay2 = null } = {}) {
  return {
    active,
    colorScheme: scheme,
    overlay1,
    overlay2,
    statusBarStyle: scheme === ColorScheme.LIGHT ? 'dark' : 'light',
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

  const toggle = useCallback(
    async (x, y) => {
      const nextScheme =
        colorScheme === ColorScheme.LIGHT ? ColorScheme.DARK : ColorScheme.LIGHT;

      dispatch(buildState(colorScheme, { active: true }));

      const r = Math.max(...corners.map(corner => dist(corner, { x, y })));
      circle.value = { x, y, r };

      const overlay1 = await makeImageFromView(ref);
      dispatch({
        ...buildState(colorScheme, { active: true }),
        overlay1,
        overlay2: null,
        statusBarStyle: nextScheme,
      });

      await wait(FRAME_MS);
      dispatch({
        ...buildState(nextScheme, { active: true }),
        overlay1,
        overlay2: null,
        statusBarStyle: nextScheme,
      });

      await wait(FRAME_MS);
      const overlay2 = await makeImageFromView(ref);
      dispatch({
        ...buildState(nextScheme, { active: true }),
        overlay1,
        overlay2,
        statusBarStyle: nextScheme,
      });

      transition.value = 0;
      transition.value = withTiming(1, { duration: TRANSITION_MS });
      await wait(TRANSITION_MS);
      dispatch(buildState(nextScheme));
      await AsyncStorage.setItem(STORAGE_KEYS.COLOR_SCHEME, nextScheme);
    },
    [circle, colorScheme, dispatch, ref, transition],
  );

  return {
    colorScheme,
    isDarkMode: isLightModeLocked ? false : colorScheme === ColorScheme.DARK,
    isLightModeLocked: Boolean(isLightModeLocked),
    isAnimating: active,
    active,
    colors,
    toggle,
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
  const [{ colorScheme, overlay1, overlay2, active, statusBarStyle }, dispatch] = useReducer(
    colorSchemeReducer,
    defaultContextValue,
  );
  const revealRadius = useDerivedValue(() => mix(transition.value, 0, circle.value.r));
  const colors = useMemo(() => getPalette(colorScheme), [colorScheme]);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEYS.COLOR_SCHEME).then(stored => {
      if (cancelled || hasHydratedRef.current) {
        return;
      }
      hasHydratedRef.current = true;
      if (isColorScheme(stored)) {
        dispatch(buildState(stored));
      }
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
        backgroundColor={colors.background}
      />
      <View ref={ref} style={styles.fill} collapsable={false}>
        <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>
      </View>
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
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
});
