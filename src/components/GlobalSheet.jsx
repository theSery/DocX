import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useThemedStyles } from '../hooks';
import { FONT_FAMILY, palette } from '../theme';
import { Typography } from './typography';
import WarningSvg from './icons/WarningSvg';
import GradientButton from './buttons/GradientButton';
import { SkiaVideoPlayer } from './videoPlayer';

let showSheetHandler = null;

const ACTION_FONT_SIZE = 16;
const ACTION_FONT_SIZE_COMPACT = 14;
/** Shrink when text is within this many px of (or past) the available width. */
const ACTION_TEXT_EDGE_THRESHOLD = 15;

/**
 * @typedef {{
 *   label: string;
 *   onPress?: () => void;
 *   destructive?: boolean;
 *   icon?: import('react').ReactNode;
 *   labelStyle?: import('react-native').TextStyle;
 * }} SheetAction
 */

/**
 * @typedef {{
 *   label: string;
 *   icon?: import('react').ReactNode;
 *   disabled?: boolean;
 *   onPress?: () => void;
 * }} MenuItem
 */

/**
 * @typedef {{
 *   variant?: 'default' | 'info' | 'menu';
 *   message?: string;
 *   description?: string;
 *   content?: import('react-native').ImageSourcePropType | string | null;
 *   customContent?: import('react').ReactNode;
 *   videoUrl?: string | null;
 *   actions?: SheetAction[];
 *   menuItems?: MenuItem[];
 *   onDismiss?: () => void;
 *   messageStyle?: import('react-native').TextStyle;
 *   contentImageStyle?: import('react-native').ImageStyle;
 * }} GlobalSheetOptions
 */

/**
 * @param {GlobalSheetOptions} options
 */
export function showGlobalSheet(options) {
  showSheetHandler?.(options);
}

/**
 * Info sheet with title, image or video, and description in a column.
 * @param {{
 *   title: string;
 *   description?: string;
 *   videoUrl?: string | null;
 *   content?: import('react-native').ImageSourcePropType | string | null;
 *   actions?: SheetAction[];
 * }} options
 */
export function showInfoSheet({
  title,
  description,
  videoUrl,
  content,
  actions = [{ label: 'Փակել' }],
}) {
  showGlobalSheet({
    variant: 'info',
    message: title,
    description,
    videoUrl,
    content,
    actions,
  });
}

function resolveImageSource(content) {
  if (!content) {
    return null;
  }

  if (typeof content === 'string') {
    return { uri: content };
  }

  return content;
}

/**
 * Keeps the default action font size when text fits; if it crowds the button
 * edge (within ~15px), drops the size by 2 without changing button layout.
 */
function AdaptiveActionLabel({ label, style }) {
  const [fontSize, setFontSize] = useState(ACTION_FONT_SIZE);
  const availableWidthRef = useRef(0);
  const textWidthRef = useRef(0);
  const settledRef = useRef(false);

  useEffect(() => {
    settledRef.current = false;
    textWidthRef.current = 0;
    setFontSize(ACTION_FONT_SIZE);
  }, [label]);

  const tryFit = useCallback(() => {
    if (settledRef.current) {
      return;
    }

    const availableWidth = availableWidthRef.current;
    const textWidth = textWidthRef.current;
    if (!availableWidth || !textWidth) {
      return;
    }

    settledRef.current = true;
    if (textWidth > availableWidth - ACTION_TEXT_EDGE_THRESHOLD) {
      setFontSize(ACTION_FONT_SIZE_COMPACT);
    }
  }, []);

  return (
    <View
      style={stylesActionLabel.wrap}
      onLayout={event => {
        availableWidthRef.current = event.nativeEvent.layout.width;
        tryFit();
      }}
    >
      {/* Unconstrained measure pass using the same font metrics as the label. */}
      <Typography
        pointerEvents="none"
        style={[
          stylesActionLabel.measure,
          {
            fontSize: ACTION_FONT_SIZE,
            fontFamily: FONT_FAMILY.regular,
          },
        ]}
        onLayout={event => {
          textWidthRef.current = event.nativeEvent.layout.width;
          tryFit();
        }}
      >
        {label}
      </Typography>
      <Typography numberOfLines={1} style={[style, { fontSize, width: '100%' }]}>
        {label}
      </Typography>
    </View>
  );
}

const stylesActionLabel = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  measure: {
    position: 'absolute',
    opacity: 0,
    left: -10000,
    top: 0,
  },
});

function SheetActions({ actions, styles, onActionPress }) {
  const isSingleAction = actions.length === 1;

  return (
    <View style={styles.actions}>
      {actions.map((action, index) => (
        <Pressable
          key={`${action.label}-${index}`}
          onPress={() => onActionPress(action)}
          style={[
            styles.actionButton,
            isSingleAction && styles.actionButtonFull,
            action.destructive && styles.destructiveButton,
          ]}
        >
          {!action.destructive ? (
            <GradientButton height={45} isLight={false}>
              {action.icon ? (
                <View style={styles.actionButtonInner}>
                  {action.icon}
                  <Typography
                    numberOfLines={1}
                    style={[styles.actionTextGradient, styles.actionTextWithIcon, action.labelStyle]}
                  >
                    {action.label}
                  </Typography>
                </View>
              ) : (
                <AdaptiveActionLabel
                  label={action.label}
                  style={[styles.actionTextGradient, action.labelStyle]}
                />
              )}
            </GradientButton>
          ) : (
            <Typography style={[styles.actionText, action.labelStyle]}>
              {action.label}
            </Typography>
          )}
        </Pressable>
      ))}
    </View>
  );
}

function DefaultSheetContent({ sheet, styles, onActionPress }) {
  return (
    <View style={styles.warningContainer}>
      {sheet.content ? (
        <Image
          source={resolveImageSource(sheet.content)}
          style={[styles.contentImage, sheet.contentImageStyle]}
          resizeMode="contain"
        />
      ) : (
        <WarningSvg width={45} height={45} fill={palette.red} />
      )}
      <Typography variant="h4" style={[styles.message, sheet.messageStyle]}>
        {sheet.message}
      </Typography>
      {sheet.description ? (
        <Typography variant="h6" style={styles.description}>
          {sheet.description}
        </Typography>
      ) : null}
      {sheet.customContent ? (
        <View style={styles.customContent}>{sheet.customContent}</View>
      ) : null}
      <SheetActions actions={sheet.actions} styles={styles} onActionPress={onActionPress} />
    </View>
  );
}

function MenuSheetContent({ sheet, styles, onMenuItemPress }) {
  return (
    <View style={styles.menuContainer}>
      {sheet.menuItems?.map((item, index) => (
        <View key={`${item.label}-${index}`}>
          <Pressable
            disabled={item.disabled}
            onPress={() => onMenuItemPress(item)}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && !item.disabled && styles.menuItemPressed,
            ]}
          >
            {item.icon ? <View style={styles.menuItemIcon}>{item.icon}</View> : null}
            <Typography
              variant="h5"
              style={[styles.menuItemText, item.disabled && styles.menuItemTextDisabled]}
            >
              {item.label}
            </Typography>
          </Pressable>
          {index < sheet.menuItems.length - 1 ? <View style={styles.menuItemDivider} /> : null}
        </View>
      ))}
    </View>
  );
}

function InfoSheetContent({ sheet, styles, onActionPress }) {
  const imageSource = resolveImageSource(sheet.content);

  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={styles.infoContainer}
      showsVerticalScrollIndicator={false}
    >
      <Typography variant="h3" style={styles.infoTitle}>
        {sheet.message}
      </Typography>

      {sheet.videoUrl ? (
        <View style={styles.infoMedia}>
          {/* <SkiaVideoPlayer youtubeUrl={sheet.videoUrl} /> */}
        </View>
      ) : imageSource ? (
        <Image
          source={imageSource}
          style={styles.infoImage}
          resizeMode="cover"
        />
      ) : null}

      {sheet.description ? (
        <Typography variant="h5" tone="secondary" style={styles.infoDescription}>
          {sheet.description}
        </Typography>
      ) : null}

      {/* <SheetActions actions={sheet.actions} styles={styles} onActionPress={onActionPress} /> */}
    </ScrollView>
  );
}

export function GlobalSheetProvider({ children }) {
  const [sheet, setSheet] = useState(null);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    showSheetHandler = options => {
      setSheet(options);
      visibleRef.current = true;
      setVisible(true);
    };
    return () => {
      showSheetHandler = null;
    };
  }, []);

  const closeSheet = useCallback(() => {
    sheet?.onDismiss?.();
    visibleRef.current = false;
    setVisible(false);
  }, [sheet]);

  // Only clear sheet after dismiss if nothing new was opened while the
  // previous modal was still animating out (e.g. confirm → OTP sheet).
  const handleModalDismiss = useCallback(() => {
    if (!visibleRef.current) {
      setSheet(null);
    }
  }, []);

  useEffect(() => {
    if (visible || !sheet || Platform.OS !== 'android') {
      return undefined;
    }

    if (!visibleRef.current) {
      setSheet(null);
    }
  }, [sheet, visible]);

  const handleActionPress = useCallback(action => {
    sheet?.onDismiss?.();
    visibleRef.current = false;
    setVisible(false);
    action.onPress?.();
  }, [sheet]);

  const handleMenuItemPress = useCallback(item => {
    if (item.disabled) {
      return;
    }

    sheet?.onDismiss?.();
    visibleRef.current = false;
    setVisible(false);
    item.onPress?.();
  }, [sheet]);

  return (
    <>
      {children}
      <Modal
        visible={visible}
        transparent
        statusBarTranslucent={true}
        animationType="fade"
        onRequestClose={closeSheet}
        onDismiss={handleModalDismiss}
      >
        <Pressable style={styles.backdrop} onPress={closeSheet}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {sheet ? (
              sheet.variant === 'info' ? (
                <InfoSheetContent
                  sheet={sheet}
                  styles={styles}
                  onActionPress={handleActionPress}
                />
              ) : sheet.variant === 'menu' ? (
                <MenuSheetContent
                  sheet={sheet}
                  styles={styles}
                  onMenuItemPress={handleMenuItemPress}
                />
              ) : (
                <DefaultSheetContent
                  sheet={sheet}
                  styles={styles}
                  onActionPress={handleActionPress}
                />
              )
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    warningContainer: {
      alignItems: 'center',
      marginBottom: 24,
      
    },
    infoContainer: {
      alignItems: 'stretch',
      gap: 16,

      paddingBottom: 32,
    },
    infoTitle: {
      textAlign: 'left',
      lineHeight: 22,
      fontSize: 18,
    },
    infoMedia: {
      width: '100%',
    },
    infoImage: {
      width: '100%',
      height: 180,
      borderRadius: 16,
    },
    infoDescription: {
      textAlign: 'left',
    },
    contentImage: {
      width: '100%',
      height: 100,
    },
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 32,
      maxHeight: '90%',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 8,
    },
    message: {
      width: '80%',
      textAlign: 'center',
      marginBottom: 10,
      marginTop: 16,
    },
    description: {
      width: '90%',
      textAlign: 'center',
      color: colors.textSecondary,
      marginBottom: 24,
    },
    customContent: {
      width: '100%',
      marginBottom: 8,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      gap: 10,
    },
    destructiveButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.icons,
    },
    actionButton: {
      height: 45,
      overflow: 'hidden',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      width: '50%',
    },
    actionButtonFull: {
      width: '100%',
    },
    actionText: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.regular,
      color: colors.icons,
    },
    mutedText: {
      color: colors.textSecondary,
    },
    destructiveText: {
      color: colors.dangerText,
    },
    actionTextGradient: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.regular,
      color: palette.white,
      width: '100%',
      textAlign: 'center',
    },
    actionButtonInner: {
      width: '100%',
      height: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 12,
    },
    actionTextWithIcon: {
      width: undefined,
      flexShrink: 1,
      textAlign: 'left',
    },
    menuContainer: {
      paddingBottom: 8,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 16,
      paddingHorizontal: 4,
    },
    menuItemPressed: {
      opacity: 0.7,
    },
    menuItemIcon: {
      width: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuItemText: {
      flex: 1,
      fontFamily: FONT_FAMILY.regular,
      lineHeight: 22,
    },
    menuItemTextDisabled: {
      color: colors.textDisabled,
    },
    menuItemDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.borderSubtle,
    },
  });
