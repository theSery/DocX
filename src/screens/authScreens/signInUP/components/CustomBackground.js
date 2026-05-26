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
  const builder = Skia.PathBuilder.Make();

  if (width <= 0 || height <= 0) {
    return builder.detach();
  }

  const r = CORNER_RADIUS;
  const w = width;
  const h = height;
  const mid = w / 2;
  const tabH = CONTAINER_TOP;

  if (flip >= 0.5) {
    builder.moveTo(0, h);
    builder.lineTo(0, r);
    builder.quadTo(0, 0, r, 0);
    builder.lineTo(mid - r, 0);
    builder.cubicTo(mid - r * 0.55, 0, mid - r * 0.55, r, mid, r);
    builder.lineTo(mid, tabH);
    builder.lineTo(mid, h);
    builder.lineTo(0, h);
  } else {
    builder.moveTo(w, h);
    builder.lineTo(w, r);
    builder.quadTo(w, 0, w - r, 0);
    builder.lineTo(mid + r, 0);
    builder.cubicTo(mid + r * 0.55, 0, mid + r * 0.55, r, mid, r);
    builder.lineTo(mid, tabH);
    builder.lineTo(mid, h);
    builder.lineTo(w, h);
  }

  builder.close();
  return builder.detach();
}
