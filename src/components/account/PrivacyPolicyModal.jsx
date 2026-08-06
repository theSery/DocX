import { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import CloseSvg from '../icons/CloseSvg';
import { Typography } from '../typography';
import { useTheme, useThemedStyles } from '../../hooks';

export function LegalDocumentContent({ title, fetchDocument, logKey }) {
  const styles = useThemedStyles(createContentStyles);

  useEffect(() => {
    if (!fetchDocument) {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await fetchDocument();
        if (!cancelled) {
          console.log(`${logKey} response`, response?.data ?? response);
        }
      } catch (error) {
        if (!cancelled) {
          console.log(`${logKey} error`, error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchDocument, logKey]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Typography variant="h5" tone="secondary">
          {title}
        </Typography>
      </View>
    </ScrollView>
  );
}

export function PrivacyPolicyModal({ visible, onClose, title, fetchDocument, logKey }) {
  const styles = useThemedStyles(createModalStyles);
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Typography variant="h4" style={styles.title}>
              {title}
            </Typography>
            <Pressable
              onPress={onClose}
              style={styles.closeIconButton}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <CloseSvg width={18} height={18} fill={colors.icons} />
            </Pressable>
          </View>

          <View style={styles.body}>
            {visible ? (
              <LegalDocumentContent
                title={title}
                fetchDocument={fetchDocument}
                logKey={logKey}
              />
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createContentStyles = () =>
  StyleSheet.create({
    scroll: {
      flex: 1,
      width: '100%',
    },
    contentContainer: {
      justifyContent: 'flex-start',
      paddingBottom: 16,
    },
    section: {
      width: '100%',
    },
  });

const createModalStyles = colors =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      paddingHorizontal: 6,
    },
    card: {
      width: '90%',
      height: '80%',
      backgroundColor: colors.surface,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
    },
    title: {
      flex: 1,
      lineHeight: 24,
      textAlign: 'center',
    },
    closeIconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    body: {
      flex: 1,
      minHeight: 0,
    },
  });
