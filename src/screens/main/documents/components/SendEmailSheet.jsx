import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { complaintsApi, personalDocumentsApi } from '../../../../api';
import { KeyboardAvoidingView, Typography } from '../../../../components';
import GradientButton from '../../../../components/buttons/GradientButton';
import MailIconSvg from '../../../../components/icons/MailIconSvg';
import { useTheme, useThemedStyles, useToast } from '../../../../hooks';
import { useAppSelector } from '../../../../store';
import { selectPersonalData } from '../../../../store/slices/personalDataSlice';
import { FONT_FAMILY } from '../../../../theme';
import { EMAIL_PATTERN } from '../../../../utils/patterns';
import { resolveSendAttachedDocuments } from '../utils/mapComplaintToDocument';

const SHEET_PADDING_BOTTOM = 32;

function unwrapComplaint(response) {
  return response?.data?.data ?? response?.data ?? null;
}

/**
 * Bottom sheet for sending a document to an email address.
 * KeyboardAvoidingView lifts the sheet above the keyboard on both platforms.
 */
export function SendEmailSheet({
  visible,
  documentId,
  documentTitle,
  attachedDocuments: attachedDocumentIds,
  onClose,
  onSent,
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const personalData = useAppSelector(selectPersonalData);

  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const isSendingRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      setEmail('');
      setIsSending(false);
      isSendingRef.current = false;
    }
  }, [visible]);

  const trimmedEmail = email.trim();
  const isValidEmail = EMAIL_PATTERN.test(trimmedEmail);
  const canSend = isValidEmail && !isSending;

  const handleClose = useCallback(() => {
    if (isSending) {
      return;
    }
    Keyboard.dismiss();
    onClose?.();
  }, [isSending, onClose]);

  const handleSend = useCallback(async () => {
    if (isSendingRef.current || !documentId) {
      return;
    }

    if (!isValidEmail) {
      showToast({
        title: 'Անվավեր էլ. հասցե',
        body: 'Մուտքագրեք վավեր էլ.-փոստ',
        type: 'error',
      });
      return;
    }

    isSendingRef.current = true;
    setIsSending(true);
    Keyboard.dismiss();

    try {
      let attachedReferences = attachedDocumentIds;

      if (!Array.isArray(attachedReferences) || attachedReferences.length === 0) {
        try {
          const response = await complaintsApi.getComplaint(documentId);
          const complaint = unwrapComplaint(response);
          attachedReferences = complaint?.attachedDocuments ?? [];
        } catch {
          attachedReferences = [];
        }
      }

      let personalDocuments = [];
      try {
        const response = await personalDocumentsApi.getPersonalDocuments({
          page: 1,
          limit: 100,
        });
        personalDocuments = response?.data?.data ?? response?.data ?? [];
      } catch {
        personalDocuments = [];
      }

      const attachedDocuments = resolveSendAttachedDocuments(
        attachedReferences,
        personalDocuments,
      );

      await complaintsApi.sendComplaint(documentId, {
        recipientType: 'email',
        recipientEmail: trimmedEmail,
        addresseeEmail: personalData?.email ?? '',
        attachedDocuments,
      });

      showToast({
        title: 'Փաստաթուղթը հաջողությամբ ուղարկվեց',
        body: trimmedEmail,
        type: 'success',
      });
      onSent?.(documentId);
      onClose?.();
    } catch (error) {
      console.log('error', error.response);
      showToast({
        title: 'Ուղարկումը ձախողվեց',
        body: error?.message ?? 'Անհայտ սխալ, փորձեք կրկին',
        type: 'error',
      });
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  }, [
    attachedDocumentIds,
    documentId,
    isValidEmail,
    onClose,
    onSent,
    personalData?.email,
    showToast,
    trimmedEmail,
  ]);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView behavior="padding" automaticOffset style={styles.keyboardView}>
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable
            style={[styles.sheet, { paddingBottom: SHEET_PADDING_BOTTOM }]}
            onPress={() => {}}
          >
            <ScrollView
              keyboardShouldPersistTaps="always"
              scrollEnabled={false}
              bounces={false}
              contentContainerStyle={styles.sheetContent}
            >
            <View style={styles.iconWrap}>
              <MailIconSvg width={28} height={22} fill={colors.icons} />
            </View>

            <Typography variant="h4" style={styles.title}>
              Ուղարկել էլ. հասցեով
            </Typography>

            {documentTitle ? (
              <Typography variant="h6" style={styles.subtitle} numberOfLines={2}>
                {documentTitle}
              </Typography>
            ) : null}

            <View style={styles.inputRow}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="example@docx.am"
                placeholderTextColor={colors.textDisabled}
                style={styles.input}
                editable={!isSending}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={handleSend}
              />
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={handleClose}
                disabled={isSending}
                style={[styles.actionButton, styles.cancelButton]}
              >
                <Typography style={styles.cancelText}>Չեղարկել</Typography>
              </Pressable>
              <Pressable
                onPressIn={handleSend}
                disabled={!canSend}
                style={[styles.actionButton, !canSend && styles.actionButtonDisabled]}
              >
                <View pointerEvents="none" style={styles.sendButtonFill}>
                  <GradientButton height={45} isLight={false}>
                    <Typography style={styles.sendText}>
                      {isSending ? 'Ուղարկվում է...' : 'Ուղարկել'}
                    </Typography>
                  </GradientButton>
                </View>
              </Pressable>
            </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    keyboardView: {
      flex: 1,
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
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 8,
    },
    sheetContent: {
      alignItems: 'center',
      width: '100%',
    },
    iconWrap: {
      marginBottom: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
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
    sendButtonFill: {
      flex: 1,
      width: '100%',
    },
    actionButtonDisabled: {
      opacity: 0.5,
    },
    cancelButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.icons,
    },
    cancelText: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.regular,
      color: colors.icons,
    },
    sendText: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.regular,
      color: colors.buttonTextOnPrimary,
    },
  });
