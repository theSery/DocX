import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const COMPACT_CONTENT_HEIGHT = 700;
const LARGE_CONTENT_HEIGHT = COMPACT_CONTENT_HEIGHT;
const LOGO_WIDTH = 200;
const LOGO_HEIGHT = 58;
const SLIDE_IMAGE_WIDTH = 300;
const SLIDE_IMAGE_HEIGHT = 400;
const FOLDERS_WIDTH = 280;
const FOLDERS_HEIGHT = 230;
const BUTTON_SIZE = 44;
const COMPACT_BUTTON_HEIGHT = 35;

/**
 * Shared screen metrics. Large phones keep their original sizes; shorter
 * screens get a compact scale. `contentHeight` is the area below the status
 * bar (safe-area top inset is already applied).
 */
export function buildResponsiveLayout({ width, contentHeight, bottomInset }) {
  const compact = contentHeight < LARGE_CONTENT_HEIGHT;
  const scale = compact ? Math.max(0.62, Math.min(1, contentHeight / 780)) : 1;
  const tight = contentHeight < 620;

  const logoWidth = Math.round(LOGO_WIDTH * (compact ? Math.max(scale, 0.78) : 1));
  const logoHeight = Math.round(LOGO_HEIGHT * (compact ? Math.max(scale, 0.78) : 1));

  const buttonHeight = compact ? COMPACT_BUTTON_HEIGHT : BUTTON_SIZE;
  const controlsPadding = compact ? 12 : 30;
  const bottomOffset =
    Platform.OS === 'android' ? Math.max(bottomInset, 0) + (compact ? 8 : 12) : 20;
  const controlsReserve =
    bottomOffset + buttonHeight + controlsPadding * 2 + (compact ? 8 : 4);

  const textBlockHeight = tight ? 72 : compact ? 80 : 88;
  const topOffset = compact ? Math.min(12, Math.round(width * 0.03)) : width * 0.25;

  const reserved =
    topOffset + logoHeight + textBlockHeight + controlsReserve + (compact ? 16 : 24);
  const slideImageHeight = Math.max(
    140,
    Math.min(SLIDE_IMAGE_HEIGHT, Math.round(contentHeight - reserved)),
  );
  const slideImageWidth = Math.round(
    SLIDE_IMAGE_WIDTH * Math.min(1, slideImageHeight / SLIDE_IMAGE_HEIGHT),
  );

  const foldersMaxHeight = Math.max(
    120,
    Math.min(
      FOLDERS_HEIGHT,
      Math.round(contentHeight - topOffset - logoHeight - textBlockHeight - buttonHeight - (compact ? 28 : 48)),
    ),
  );
  const foldersScale = Math.min(1, foldersMaxHeight / FOLDERS_HEIGHT);
  const foldersWidth = Math.round(FOLDERS_WIDTH * foldersScale);
  const sizeScale = compact ? Math.max(scale, 0.78) : 1;
  const scaleSize = size => Math.round(size * sizeScale);

  return {
    compact,
    tight,
    scale,
    scaleSize,
    topOffset,
    bottomOffset,
    buttonHeight,
    controlsPadding,
    controlsReserve,
    logo: {
      width: logoWidth,
      height: logoHeight,
    },
    slideImage: {
      width: slideImageWidth,
      height: compact ? slideImageHeight : SLIDE_IMAGE_HEIGHT,
    },
    folders: {
      width: Math.min(FOLDERS_WIDTH, foldersWidth),
      height: compact ? foldersMaxHeight : FOLDERS_HEIGHT,
    },
    itemText: {
      fontSize: tight ? 16 : compact ? 17 : 20,
      lineHeight: tight ? 22 : compact ? 24 : 28,
      letterSpacing: compact ? 0.6 : 2.4,
      marginHorizontal: width < 380 ? 28 : 50,
    },
    contentPaddingBottom: Platform.OS === 'android' ? Math.max(bottomInset, 0) : 0,
  };
}

export function useIsCompactScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentHeight = Math.max(0, height - insets.top);

  return contentHeight < COMPACT_CONTENT_HEIGHT;
}

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentHeight = Math.max(0, height - insets.top);

  return useMemo(
    () =>
      buildResponsiveLayout({
        width,
        contentHeight,
        bottomInset: insets.bottom,
      }),
    [width, contentHeight, insets.bottom],
  );
}
