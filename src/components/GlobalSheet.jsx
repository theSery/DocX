import { useCallback, useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { useThemedStyles } from '../hooks';
import { FONT_FAMILY, palette } from '../theme';
import { Typography } from './typography';
import WarningSvg from './icons/WarningSvg';
import GradientButton from './buttons/GradientButton';

let showSheetHandler = null;

/**
 * @param {{ message: string, actions: Array<{ label: string, onPress?: () => void, destructive?: boolean }> }} options
 */
export function showGlobalSheet(options) {
  showSheetHandler?.(options);
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
          <Pressable style={styles.sheet} onPress={() => { }}>
            {sheet ? (
              <View style={styles.warningContainer}>
                <WarningSvg width={45} height={45} fill={'#FF5C5C'} />
                <Typography variant="h4" style={styles.message}>
                  {sheet.message}
                </Typography>
                {sheet.description && (
                  <Typography variant="h6" style={styles.description}>
                    {sheet.description}
                  </Typography>
                )}
                <View style={styles.actions}>
                  {sheet.actions.map((action, index) => (

                    <Pressable
                      key={`${action.label}-${index}`}
                      onPress={() => handleActionPress(action)}
                      style={[styles.actionButton, action.destructive && styles.destructiveButton]}
                    >
                      {!action.destructive ? <GradientButton height={45} isLight={false} >
                        <Typography
                          style={[
                            styles.actionTextGradient
                          ]}
                        >
                          {action.label}
                        </Typography>
                      </GradientButton> : <Typography
                        style={[
                          styles.actionText,
                        ]}
                      >
                       {action.label}
                      </Typography>}
                      
                      {/* < */}
                    </Pressable>
                  ))}
                </View>
              </View>
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
    },
    message: {
      width: '80%',
      textAlign: 'center',
      // color: colors.text,
      marginBottom: 10,
      marginTop: 16,
    },
    description: {
      width: '90%',
      textAlign: 'center',
      color: colors.textSecondary,
      marginBottom: 24,
      // marginTop: 16,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // borderTopWidth: StyleSheet.hairlineWidth,
      // borderTopColor: colors.border,
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
