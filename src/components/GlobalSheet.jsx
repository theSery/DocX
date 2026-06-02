import { useCallback, useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { useThemedStyles } from '../hooks';
import { FONT_FAMILY } from '../theme';
import { Typography } from './typography';

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
          <Pressable style={styles.sheet} onPress={() => {}}>
            {sheet ? (
              <>
                <Typography variant="h5" style={styles.message}>
                  {sheet.message}
                </Typography>
                <View style={styles.actions}>
                  {sheet.actions.map((action, index) => (
                    <Pressable
                      key={`${action.label}-${index}`}
                      onPress={() => handleActionPress(action)}
                      style={styles.actionButton}
                    >
                      <Typography
                        style={[
                          styles.actionText,
                          action.destructive && styles.destructiveText,
                          !action.destructive && styles.mutedText,
                        ]}
                      >
                        {action.label}
                      </Typography>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 32,
    },
    message: {
      textAlign: 'center',
      color: colors.text,
      marginBottom: 24,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    actionButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    actionText: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.regular,
      color: colors.primary,
    },
    mutedText: {
      color: colors.textSecondary,
    },
    destructiveText: {
      color: colors.dangerText,
    },
  });
