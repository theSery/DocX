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
import { getPalette, lightColors } from './palettes';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const getSystemScheme = () => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');

const defaultScheme = getSystemScheme();
const defaultValue = {
  active: false,
  statusBarStyle: defaultScheme === 'light' ? 'dark' : 'light',
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
    statusBarStyle: scheme === 'light' ? 'dark' : 'light',
  };
}

export function useColorSchemeContext() {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) {
    throw new Error('useColorSchemeContext must be used inside ColorSchemeProvider.');
  }

  const { colorScheme, dispatch, ref, transition, circle, active, colors, isLightModeLocked } =
    ctx;

  const toggle = useCallback(
    async (x, y) => {
      const newColorScheme = colorScheme === 'light' ? 'dark' : 'light';

      dispatch(buildState(colorScheme, { active: true }));

      const r = Math.max(...corners.map(corner => dist(corner, { x, y })));
      circle.value = { x, y, r };

      const overlay1 = await makeImageFromView(ref);
      dispatch({
        ...buildState(colorScheme, { active: true }),
        overlay1,
        overlay2: null,
        statusBarStyle: newColorScheme,
      });

      await wait(16);
      dispatch({
        ...buildState(newColorScheme, { active: true }),
        overlay1,
        overlay2: null,
        statusBarStyle: newColorScheme,
      });

      await wait(16);
      const overlay2 = await makeImageFromView(ref);
      dispatch({
        ...buildState(newColorScheme, { active: true }),
        overlay1,
        overlay2,
        statusBarStyle: newColorScheme,
      });

      transition.value = 0;
      transition.value = withTiming(1, { duration: 650 });
      await wait(650);
      dispatch(buildState(newColorScheme));
      await AsyncStorage.setItem(STORAGE_KEYS.COLOR_SCHEME, newColorScheme);
    },
    [circle, colorScheme, dispatch, ref, transition],
  );

  return {
    colorScheme,
    isDarkMode: isLightModeLocked ? false : colorScheme === 'dark',
    isLightModeLocked: Boolean(isLightModeLocked),
    isAnimating: active,
    active,
    colors,
    toggle,
  };
}

/**
 * Locks theme-aware UI to the light palette (auth / onboarding flows).
 * Global color scheme preference is unchanged when the user leaves this scope.
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
    defaultValue,
  );
  const r = useDerivedValue(() => mix(transition.value, 0, circle.value.r));
  const colors = useMemo(() => getPalette(colorScheme), [colorScheme]);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEYS.COLOR_SCHEME).then(stored => {
      if (cancelled || hasHydratedRef.current) {
        return;
      }
      hasHydratedRef.current = true;
      if (stored === 'light' || stored === 'dark') {
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
          <Circle c={circle} r={r}>
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
