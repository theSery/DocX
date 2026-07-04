import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Typography } from '../../../../components';
import GradientButton from '../../../../components/buttons/GradientButton';
import { FONT_FAMILY } from '../../../../theme';
import { useTheme, useThemedStyles } from '../../../../hooks';
import { getUploadPreviewContent } from '../utils/personalDocumentFilePicker';

function resolveImageSource(content) {
  if (!content) {
    return null;
  }

  if (typeof content === 'string') {
    return { uri: content };
  }

  return content;
}

function stripExtension(name) {
  const lastDot = name.lastIndexOf('.');
  return lastDot > 0 ? name.slice(0, lastDot) : name;
}

export function FileUploadSheet({ visible, pickedFile, onClose, onUpload, isUploading }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (pickedFile?.name) {
      setFileName(stripExtension(pickedFile.name));
    } else {
      setFileName('');
    }
  }, [pickedFile]);

  const trimmedName = fileName.trim();
  const canUpload = trimmedName.length > 0 && !isUploading;
  const previewSource = pickedFile ? resolveImageSource(getUploadPreviewContent(pickedFile)) : null;

  const handleUpload = () => {
    if (!canUpload) {
      return;
    }

    onUpload?.(trimmedName);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {previewSource ? (
            <Image
              source={previewSource}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : null}

          <Typography variant="h4" style={styles.title}>
            Վերբեռնել ֆայլ
          </Typography>

          {pickedFile?.name ? (
            <Typography variant="h6" style={styles.fileHint}>
              {pickedFile.name}
            </Typography>
          ) : null}

          <View style={styles.inputRow}>
            <TextInput
              value={fileName}
              onChangeText={setFileName}
              placeholder="Ֆայլի անվանում"
              placeholderTextColor={colors.textDisabled}
              style={styles.input}
              editable={!isUploading}
              autoFocus
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              disabled={isUploading}
              style={[styles.actionButton, styles.cancelButton]}
            >
              <Typography style={styles.cancelText}>Չեղարկել</Typography>
            </Pressable>
            <Pressable
              onPress={handleUpload}
              disabled={!canUpload}
              style={[styles.actionButton, !canUpload && styles.actionButtonDisabled]}
            >
              <GradientButton height={45} isLight={false}>
                <Typography style={styles.uploadText}>
                  {isUploading ? 'Վերբեռնում...' : 'Վերբեռնել'}
                </Typography>
              </GradientButton>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 32,
      alignItems: 'center',
    },
    previewImage: {
      width: '100%',
      height: 100,
      marginBottom: 16,
    },
    title: {
      textAlign: 'center',
      marginBottom: 8,
    },
    fileHint: {
      textAlign: 'center',
      color: colors.textSecondary,
      marginBottom: 16,
    },
    inputRow: {
      width: '100%',
      height: 45,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.input,
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    input: {
      flex: 1,
      height: '100%',
      fontFamily: FONT_FAMILY.regular,
      fontSize: 16,
      color: colors.text,
    },
    actions: {
      flexDirection: 'row',
      width: '100%',
      gap: 10,
    },
    actionButton: {
      flex: 1,
      height: 45,
      borderRadius: 10,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtonDisabled: {
      opacity: 0.5,
    },
    cancelButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.mainBlue,
    },
    cancelText: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.regular,
      color: colors.mainBlue,
    },
    uploadText: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.regular,
      color: colors.buttonTextOnPrimary,
    },
  });
