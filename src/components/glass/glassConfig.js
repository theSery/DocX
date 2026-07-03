export const GLASS = {
  light: {
    blurAmount: 32,
    tint: 'rgba(255, 255, 255, 1)',
    overlayColor: 'rgba(255, 255, 255, 1)',
    fallback: '#FFFFFF',
    border: 'rgba(255, 255, 255, 1)',
    sheen: [
      { offset: '0%', color: '#FFFFFF', opacity: 0.55 },
      { offset: '38%', color: '#FFFFFF', opacity: 0.14 },
      { offset: '100%', color: '#FFFFFF', opacity: 0 },
    ],
    rim: 'rgba(255, 255, 255, 1)',
  },
  dark: {
    blurAmount: 28,
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
