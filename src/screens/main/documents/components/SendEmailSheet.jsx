import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { complaintsApi } from '../../../../api';
import { Typography } from '../../../../components';
import GradientButton from '../../../../components/buttons/GradientButton';
import { getAndroidKeyboardOverlayInset } from '../../../../components/form/formKeyboard';
import MailIconSvg from '../../../../components/icons/MailIconSvg';
import { useTheme, useThemedStyles, useToast } from '../../../../hooks';
import { useAppSelector } from '../../../../store';
import { selectPersonalData } from '../../../../store/slices/personalDataSlice';
import { FONT_FAMILY } from '../../../../theme';
import { EMAIL_PATTERN } from '../../../../utils/patterns';
import { resolveAttachedDocumentIds } from '../utils/mapComplaintToDocument';

const SHEET_PADDING_BOTTOM = 32;

function resolveKeyboardInset(event) {
  const end = event?.endCoordinates;
  if (!end) {
    return 0;
  }

  const keyboardTop = typeof end.screenY === 'number' ? end.screenY : null;
  const keyboardHeight = typeof end.height === 'number' ? end.height : 0;

  if (Platform.OS === 'ios') {
    return keyboardHeight;
  }

  return getAndroidKeyboardOverlayInset(keyboardTop, keyboardHeight);
}

function unwrapComplaint(response) {
  return response?.data?.data ?? response?.data ?? null;
}

/**
 * Bottom sheet for sending a document to an email address.
 * Grows bottom padding by the keyboard inset so content stays above the
 * keyboard while the sheet keeps its natural content height.
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
  const [keyboardInset, setKeyboardInset] = useState(0);
  const isSendingRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      setEmail('');
      setIsSending(false);
      setKeyboardInset(0);
      isSendingRef.current = false;
      return undefined;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleShow = event => {
      setKeyboardInset(resolveKeyboardInset(event));
    };
    const handleHide = () => {
      setKeyboardInset(0);
    };

    const showSub = Keyboard.addListener(showEvent, handleShow);
    const hideSub = Keyboard.addListener(hideEvent, handleHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
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
      let attachedDocuments = resolveAttachedDocumentIds(attachedDocumentIds);

      if (attachedDocuments.length === 0) {
        try {
          const response = await complaintsApi.getComplaint(documentId);
          const complaint = unwrapComplaint(response);
          attachedDocuments = resolveAttachedDocumentIds(
            complaint?.attachedDocuments,
          );
        } catch {
          attachedDocuments = [];
        }
      }

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
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable
          style={[
            styles.sheet,
            { paddingBottom: SHEET_PADDING_BOTTOM + keyboardInset },
          ]}
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
