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
import { ColorScheme, isThemePreference, ThemePreference } from './constants';
import { getPalette, lightColors } from './palettes';

const TRANSITION_MS = 650;
const FRAME_MS = 16;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const getSystemScheme = () =>
  Appearance.getColorScheme() === ColorScheme.DARK ? ColorScheme.DARK : ColorScheme.LIGHT;

const resolveColorScheme = (themePreference, systemScheme = getSystemScheme()) =>
  themePreference === ThemePreference.SYSTEM ? systemScheme : themePreference;

const defaultSystemScheme = getSystemScheme();

const defaultContextValue = {
  active: false,
  statusBarStyle: defaultSystemScheme === ColorScheme.LIGHT ? 'dark' : 'light',
  colorScheme: defaultSystemScheme,
  themePreference: ThemePreference.SYSTEM,
  overlay1: null,
  overlay2: null,
};

const ColorSchemeContext = createContext(null);

const colorSchemeReducer = (_, nextState) => nextState;

const { width, height } = Dimensions.get('screen');
const corners = [vec(0, 0), vec(width, 0), vec(width, height), vec(0, height)];

function buildState({
  colorScheme,
  themePreference,
  active = false,
  overlay1 = null,
  overlay2 = null,
}) {
  return {
    active,
    colorScheme,
    themePreference,
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
    themePreference,
    dispatch,
    ref,
    transition,
    circle,
    active,
    colors,
    isLightModeLocked,
  } = ctx;

  const setThemePreference = useCallback(
    async (preference, x, y) => {
      if (preference === themePreference) {
        return;
      }

      const nextScheme = resolveColorScheme(preference);

      if (nextScheme === colorScheme) {
        dispatch(buildState({ colorScheme, themePreference: preference }));
        await AsyncStorage.setItem(STORAGE_KEYS.COLOR_SCHEME, preference);
        return;
      }

      dispatch(buildState({ colorScheme, themePreference, active: true }));

      const r = Math.max(...corners.map(corner => dist(corner, { x, y })));
      circle.value = { x, y, r };

      const overlay1 = await makeImageFromView(ref);
      dispatch({
        ...buildState({ colorScheme, themePreference, active: true }),
        overlay1,
        overlay2: null,
        statusBarStyle: nextScheme === ColorScheme.LIGHT ? 'dark' : 'light',
      });

      await wait(FRAME_MS);
      dispatch({
        ...buildState({ colorScheme: nextScheme, themePreference: preference, active: true }),
        overlay1,
        overlay2: null,
        statusBarStyle: nextScheme === ColorScheme.LIGHT ? 'dark' : 'light',
      });

      await wait(FRAME_MS);
      const overlay2 = await makeImageFromView(ref);
      dispatch({
        ...buildState({ colorScheme: nextScheme, themePreference: preference, active: true }),
        overlay1,
        overlay2,
        statusBarStyle: nextScheme === ColorScheme.LIGHT ? 'dark' : 'light',
      });

      transition.value = 0;
      transition.value = withTiming(1, { duration: TRANSITION_MS });
      await wait(TRANSITION_MS);
      dispatch(buildState({ colorScheme: nextScheme, themePreference: preference }));
      await AsyncStorage.setItem(STORAGE_KEYS.COLOR_SCHEME, preference);
    },
    [circle, colorScheme, dispatch, ref, themePreference, transition],
  );

  return {
    colorScheme,
    themePreference,
    isDarkMode: isLightModeLocked ? false : colorScheme === ColorScheme.DARK,
    isLightModeLocked: Boolean(isLightModeLocked),
    isAnimating: active,
    active,
    colors,
    setThemePreference,
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
  const themePreferenceRef = useRef(ThemePreference.SYSTEM);
  const activeRef = useRef(false);
  const [
    { colorScheme, themePreference, overlay1, overlay2, active, statusBarStyle },
    dispatch,
  ] = useReducer(colorSchemeReducer, defaultContextValue);
  const revealRadius = useDerivedValue(() => mix(transition.value, 0, circle.value.r));
  const colors = useMemo(() => getPalette(colorScheme), [colorScheme]);

  useEffect(() => {
    themePreferenceRef.current = themePreference;
    activeRef.current = active;
  }, [active, themePreference]);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEYS.COLOR_SCHEME).then(stored => {
      if (cancelled || hasHydratedRef.current) {
        return;
      }
      hasHydratedRef.current = true;

      const preference = isThemePreference(stored) ? stored : ThemePreference.SYSTEM;
      const systemScheme = getSystemScheme();
      dispatch(
        buildState({
          colorScheme: resolveColorScheme(preference, systemScheme),
          themePreference: preference,
        }),
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: systemScheme }) => {
      if (themePreferenceRef.current !== ThemePreference.SYSTEM || activeRef.current) {
        return;
      }

      const nextScheme =
        systemScheme === ColorScheme.DARK ? ColorScheme.DARK : ColorScheme.LIGHT;

      dispatch(
        buildState({
          colorScheme: nextScheme,
          themePreference: ThemePreference.SYSTEM,
        }),
      );
    });

    return () => subscription.remove();
  }, []);

  const value = useMemo(
    () => ({
      active,
      colorScheme,
      themePreference,
      overlay1,
      overlay2,
      dispatch,
      ref,
      transition,
      circle,
      statusBarStyle,
      colors,
    }),
    [active, circle, colorScheme, colors, overlay1, overlay2, statusBarStyle, themePreference, transition],
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
