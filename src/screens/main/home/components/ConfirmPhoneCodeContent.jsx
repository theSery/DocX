import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AnimatedView, Typography } from '../../../../components';
import AuthButton from '../../../../components/buttons/AuthButton';
import { ContentTiltes } from '../../../../components/titleComponents/ContentTiltles';
import { OtpInputRowCode } from '../../../authScreens/signInUP/components/OtpInputRowCode';
import { smsApi } from '../../../../api';
import { useOtpInput, useThemedStyles, useToast } from '../../../../hooks';
import { FONT_FAMILY } from '../../../../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../../utils/dimensions';
import { useState } from 'react';

function formatPhoneForDisplay(phoneNumber) {
  const digits = phoneNumber?.replace(/\D/g, '') ?? '';
  const local = digits.startsWith('374') ? digits.slice(3) : digits;

  if (!local.length) {
    return '';
  }
  if (local.length <= 2) {
    return local;
  }
  if (local.length <= 5) {
    return `${local.slice(0, 2)} ${local.slice(2)}`;
  }
  return `${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
}

const createStyles = colors =>
  StyleSheet.create({
    body: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    contentContainer: {
      width: '100%',
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingTop: 20,
    },
    otpSection: {
      marginTop: 8,
    },
    resendContainer: {
      alignItems: 'center',
      marginTop: 20,
      gap: 4,
    },
    resendHelper: {
      fontSize: 12,
      fontFamily: FONT_FAMILY.regular,
      color: colors.textSecondary,
    },
    resendLink: {
      fontSize: 12,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.icons,
      textDecorationLine: 'underline',
    },
    disabledOpacity: {
      opacity: 0.6,
    },
    footer: {
      paddingTop: 12,
      backgroundColor: colors.background,
    },
  });

export function ConfirmPhoneCodeContent({ phoneNumber, onConfirmed }) {
  const styles = useThemedStyles(createStyles);
  const { showToast } = useToast();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const {
    code: otpCode,
    isComplete,
    reset: resetOtp,
    inputProps: otpInputProps,
  } = useOtpInput();

  const displayPhone = formatPhoneForDisplay(phoneNumber);
  const isConfirmDisabled = isVerifying || !isComplete;

  const handleVerifyCode = async () => {
    if (otpCode.length !== 6) {
      showToast({
        title: 'Սխալ կոդ',
        body: 'Մուտքագրեք 6 նիշանոց կոդը',
        type: 'error',
      });
      return;
    }

    setIsVerifying(true);
    try {
      await smsApi.verifyCode({ phoneNumber, code: otpCode });
      showToast({
        title: 'Հեռախոսահամարը հաստատված է',
        type: 'success',
      });
      onConfirmed?.();
    } catch (error) {
      showToast({
        title: 'Հաստատումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await smsApi.requestCode({ phoneNumber });
      resetOtp();
      showToast({
        title: 'Կոդը ուղարկված է',
        body: 'Նոր հաստատման կոդը ուղարկվել է ձեր հեռախոսահամարին',
        type: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Ուղարկումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.body}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.contentContainer}
      >
        <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
          <ContentTiltes
            title="Հաստատման կոդ"
            subtitle={`Մուտքագրեք Ձեր ${displayPhone} հեռախոսահամարին ուղարկված կոդը`}
          />
          <View style={styles.otpSection}>
            <OtpInputRowCode {...otpInputProps} />
          </View>
          <View style={styles.resendContainer}>
            <Typography style={styles.resendHelper}>Չե՞ք ստացել կոդը</Typography>
            <Pressable
              hitSlop={8}
              onPress={handleResendCode}
              disabled={isResending}
              style={isResending && styles.disabledOpacity}
            >
              <Typography style={styles.resendLink}>
                {isResending ? 'Ուղարկվում է...' : 'Ուղարկել կրկին'}
              </Typography>
            </Pressable>
          </View>
        </AnimatedView>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: TAB_BAR_BOTTOM_OFFSET }]}>
        <AuthButton
          title="Հաստատել հեռախոսահամարը"
          onPress={handleVerifyCode}
          isLoading={isVerifying}
          disabled={isConfirmDisabled}
        />
      </View>
    </View>
  );
}
