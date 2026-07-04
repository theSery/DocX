import { palette } from '../../theme';

export const GLASS = {
  light: {
    blurAmount: 4,
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
    blurAmount: 2,
    tint: 'rgba(22, 24, 40, 0.42)',
    overlayColor: 'rgba(17, 17, 29, 0.45)',
    fallback: '#11111D',
    border: 'rgba(255, 255, 255, 0.14)',
    sheen: [
      { offset: '0%', color: '#FFFFFF', opacity: 0.2 },
      { offset: '45%', color: '#FFFFFF', opacity: 0.05 },
      { offset: '100%', color: '#FFFFFF', opacity: 0 },
    ],
    rim: 'rgba(255, 255, 255, 0.22)',
  },
};

/** Deep blue glass button — matches backButton2.webp */
export const BLUE_GLASS_BUTTON = {
  fill: {
    center: palette.blueLargeStart,
    mid: palette.mainBlue,
    edge: palette.blueLargeEnd,
  },
  border: 'rgba(130, 200, 229, 0.42)',
  sheen: [
    { offset: '0%', color: palette.white, opacity: 0.48 },
    { offset: '32%', color: palette.skyBlue, opacity: 0.14 },
    { offset: '100%', color: palette.white, opacity: 0 },
  ],
  vignette: [
    { offset: '0%', color: palette.blueLargeEnd, opacity: 0 },
    { offset: '100%', color: palette.blueLargeEnd, opacity: 0.5 },
  ],
  rim: 'rgba(200, 230, 255, 0.6)',
  shadow: {
    color: palette.blueLargeStart,
    offset: { width: 0, height: 4 },
    opacity: 0.38,
    radius: 8,
  },
};
