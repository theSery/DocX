import { palette } from '../../theme';

export const GLASS = {
  light: {
    blurAmount: 10,
    tint: 'rgba(255, 255, 255, 0.55)',
    overlayColor: 'rgba(255, 255, 255, 0.55)',
    fallback: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.65)',
    sheen: [
      { offset: '0%', color: '#FFFFFF', opacity: 0.55 },
      { offset: '38%', color: '#FFFFFF', opacity: 0.14 },
      { offset: '100%', color: '#FFFFFF', opacity: 0 },
    ],
    rim: 'rgba(255, 255, 255, 1)',
  },
  dark: {
    blurAmount: 10,
    // Matches darkColors.surface (#1A1B2E) / background (#11111D)
    tint: 'rgba(26, 27, 46, 0.55)',
    overlayColor: 'rgba(17, 17, 29, 0.55)',
    fallback: palette.black,
    border: 'rgba(255, 255, 255, 0.12)',
    sheen: [
      { offset: '0%', color: palette.darkLight, opacity: 0.32 },
      { offset: '45%', color: palette.darkLight, opacity: 0.08 },
      { offset: '100%', color: palette.black, opacity: 0 },
    ],
    rim: 'rgba(244, 246, 251, 0.18)',
  },
};
