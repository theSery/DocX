import { useCallback, useEffect, useState } from 'react';
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

/**
 * @typedef {{
 *   label: string;
 *   onPress?: () => void;
 *   destructive?: boolean;
 * }} SheetAction
 */

/**
 * @typedef {{
 *   variant?: 'default' | 'info';
 *   message: string;
 *   description?: string;
 *   content?: import('react-native').ImageSourcePropType | string | null;
 *   videoUrl?: string | null;
 *   actions: SheetAction[];
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
              <Typography style={styles.actionTextGradient}>{action.label}</Typography>
            </GradientButton>
          ) : (
            <Typography style={styles.actionText}>{action.label}</Typography>
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
          style={styles.contentImage}
          resizeMode="contain"
        />
      ) : (
        <WarningSvg width={45} height={45} fill={palette.red} />
      )}
      <Typography variant="h4" style={styles.message}>
        {sheet.message}
      </Typography>
      {sheet.description ? (
        <Typography variant="h6" style={styles.description}>
          {sheet.description}
        </Typography>
      ) : null}
      <SheetActions actions={sheet.actions} styles={styles} onActionPress={onActionPress} />
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
          <SkiaVideoPlayer youtubeUrl={sheet.videoUrl} />
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
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    showSheetHandler = options => {
      setSheet(options);
      setVisible(true);
    };
    return () => {
      showSheetHandler = null;
    };
  }, []);

  const closeSheet = useCallback(() => {
    setVisible(false);
  }, []);

  const handleModalDismiss = useCallback(() => {
    setSheet(null);
  }, []);

  useEffect(() => {
    if (visible || !sheet || Platform.OS !== 'android') {
      return undefined;
    }

    setSheet(null);
  }, [sheet, visible]);

  const handleActionPress = useCallback(action => {
    setVisible(false);
    action.onPress?.();
  }, []);

  return (
    <>
      {children}
      <Modal
        visible={visible}
        transparent
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
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      gap: 10,
    },
    destructiveButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.mainBlue,
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
      color: colors.mainBlue,
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
    },
  });
