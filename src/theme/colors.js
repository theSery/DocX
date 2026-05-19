import { lightColors } from './palettes';

export { darkColors, getPalette, lightColors } from './palettes';
export { createGlobalStyles } from './globalStyles';
export { gradients, palette } from './tokens';

/** @deprecated Use `useTheme()` for theme-aware colors. */
export const colors = lightColors;
