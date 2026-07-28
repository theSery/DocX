/**
 * Brand color primitives from the design system.
 * Prefer semantic keys from `getPalette()` / `useTheme().colors` in components.
 */
export const palette = Object.freeze({
  black: '#0f0f0f',
  white: '#F4F6FB',
  /** Brighter elevated surface (light mode) */
  pureWhite: '#FAFBFF',
  /** Brighter elevated surface (dark mode) */
  darkLight: '#25283F',
  backgroundWhite: '#F4F6FB',
  gray: '#5D6983',
  lightGray: '#9DA6BA',
  /** Soft gray for dark-mode disabled / muted text */
  darkModeGray: '#E7E7E7',
  green: '#00856F',
  red: '#FF5C5C',
  /** Light sky accent — also used as light gradient end stop */
  skyBlue: '#CFF1FF',
  /** Main solid brand blue */
  mainBlue: '#1D3D81',
  blueMainStart: '#1B4FBE',
  blueMainEnd: '#01174D',
  blueLargeStart: '#386FE5',
  blueLargeEnd: '#000B26',
  /** Account stack header — sampled from design reference */
  accountStackStart: '#194AB4',
  accountStackEnd: '#031C57',
  /** Dark mode blue gradients — deep navy around #000B26 */
  accountStackDarkStart: '#01174D',
  accountStackDarkEnd: '#000B26',
  mainWhite: '#FFFFFF',
  /** Subtle card/list border (light mode) */
  borderLight: '#D9DFED',
  /** Accent blue for icons and chevrons */
  accentBlue: '#82C8E5',
  dangerBorder: '#FCA5A5',
  dangerText: '#DC2626',
});

export const gradients = Object.freeze({
  /** Light background: white → sky blue */
  lightSky: {
    start: '#FFFFFF',
    end: palette.skyBlue,
    angle: 135,
  },
  /** Blue gradient main */
  blueMain: {
    start: palette.blueMainStart,
    end: palette.blueMainEnd,
    angle: 135,
  },
  /** Blue gradient large */
  blueLarge: {
    start: palette.blueLargeStart,
    end: palette.blueLargeEnd,
    angle: 135,
  },
  /** Dark mode button — sky blue → deep navy */
  buttonDark: {
    start: palette.skyBlue,
    end: palette.blueMainEnd,
    angle: 135,
  },
  /** BG large — inversed */
  bgLargeInversed: {
    start: palette.blueLargeEnd,
    end: palette.blueLargeStart,
    angle: 135,
  },
  /** Account stack header gradient */
  accountStack: {
    start: palette.accountStackStart,
    end: palette.accountStackEnd,
    angle: 135,
  },
  /** Dark mode blue gradient — deep navy around #000B26 */
  accountStackDark: {
    start: palette.accountStackDarkStart,
    end: palette.accountStackDarkEnd,
    angle: 135,
  },
});

/** @param {{ start: string, end: string }} gradient */
export function gradientStops(gradient) {
  return [gradient.start, gradient.end];
}
