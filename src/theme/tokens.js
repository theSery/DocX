/**
 * Brand color primitives from the design system.
 * Prefer semantic keys from `getPalette()` / `useTheme().colors` in components.
 */
export const palette = Object.freeze({
  black: '#11111D',
  white: '#FAFBFF',
  backgroundWhite: '#F4F6FB',
  gray: '#5D6983',
  lightGray: '#9DA6BA',
  green: '#00A88C',
  red: '#FF5C5C',
  skyBlue: '#82C8E5',
});

export const gradients = Object.freeze({
  lightSky: {
    start: '#FFFFFF',
    end: '#CFF1FF',
    angle: 135,
  },
  darkSky: {
    start: '#386FE5',
    end: '#000B26',
    angle: 135,
  },
});
