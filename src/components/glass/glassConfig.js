import { palette } from '../../theme';

/**
 * Shared glass tokens tuned to the example/ reference tab bar:
 * milky frosted plate, crisp white rim, soft floating shadow.
 */
export const GLASS = {
  light: {
    blurAmount: 12,
    blurType: 'xlight',
    /** Translucent plate over the native blur — milky like example/BG.png */
    fill: 'rgba(244, 246, 251, 0.48)',
    /** Soft top wash */
    highlight: 'rgba(255, 255, 255, 0.32)',
    fallback: '#F4F6FB',
    border: 'rgba(255, 255, 255, 0.85)',
    /**
     * Glass refraction profile sampled from example/BG.png —
     * bright rims, milky body, darker caustic band in the lower-middle.
     */
    sheen: [
      { offset: '0%', color: '#FFFFFF', opacity: 0.78 },
      { offset: '5%', color: '#F4F6FB', opacity: 0.16 },
      { offset: '40%', color: '#FFFFFF', opacity: 0.06 },
      { offset: '58%', color: '#7B869C', opacity: 0.16 },
      { offset: '75%', color: '#FFFFFF', opacity: 0.05 },
      { offset: '100%', color: '#FFFFFF', opacity: 0.4 },
    ],
    rim: 'rgba(255, 255, 255, 0.98)',
    rimBottom: 'rgba(255, 255, 255, 0.6)',
  },
  dark: {
    blurAmount: 32,
    blurType: 'dark',
    fill: 'rgba(17, 17, 29, 0.45)',
    highlight: 'rgba(255, 255, 255, 0.08)',
    fallback: palette.black,
    border: 'rgba(255, 255, 255, 0.18)',
    sheen: [
      { offset: '0%', color: '#FFFFFF', opacity: 0.22 },
      { offset: '8%', color: palette.darkLight, opacity: 0.12 },
      { offset: '45%', color: '#FFFFFF', opacity: 0.04 },
      { offset: '60%', color: '#000000', opacity: 0.18 },
      { offset: '100%', color: '#FFFFFF', opacity: 0.1 },
    ],
    rim: 'rgba(244, 246, 251, 0.28)',
    rimBottom: 'rgba(244, 246, 251, 0.1)',
  },
};
