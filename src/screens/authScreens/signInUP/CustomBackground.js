import { Skia } from '@shopify/react-native-skia';

export const CORNER_RADIUS = 30;
export const CONTAINER_TOP = 100;

/**
 * Builds the white active-tab panel used by AnimatedTabs.
 * @param {number} width
 * @param {number} height
 * @param {number} flip 1 = left tab active, 0 = right tab active
 */
export function buildFlippableBackgroundPath(width, height, flip) {
  const path = Skia.Path.Make();

  if (width <= 0 || height <= 0) {
    return path;
  }

  const r = CORNER_RADIUS;
  const w = width;
  const h = height;
  const mid = w / 2;
  const tabH = CONTAINER_TOP;

  if (flip >= 0.5) {
    path.moveTo(0, h);
    path.lineTo(0, r);
    path.quadTo(0, 0, r, 0);
    path.lineTo(mid - r, 0);
    path.cubicTo(mid - r * 0.55, 0, mid - r * 0.55, r, mid, r);
    path.lineTo(mid, tabH);
    path.lineTo(mid, h);
    path.lineTo(0, h);
  } else {
    path.moveTo(w, h);
    path.lineTo(w, r);
    path.quadTo(w, 0, w - r, 0);
    path.lineTo(mid + r, 0);
    path.cubicTo(mid + r * 0.55, 0, mid + r * 0.55, r, mid, r);
    path.lineTo(mid, tabH);
    path.lineTo(mid, h);
    path.lineTo(w, h);
  }

  path.close();
  return path;
}
