import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  AnimatedView,
  FormScrollView,
  Typography,
} from '../../../components';
import AuthButton from '../../../components/buttons/AuthButton';
import WarningSvg from '../../../components/icons/WarningSvg';
import { OtpInputRowCode } from '../../authScreens/signInUP/components/OtpInputRowCode';
import { accountApi, smsApi, userApi } from '../../../api';
import {
  useAuthSession,
  useGlobalStyles,
  useOtpInput,
  useThemedStyles,
  useToast,
} from '../../../hooks';
import { useAppDispatch } from '../../../store';
import {
  fetchPersonalData,
  setPhoneVerified,
  setUserFlags,
} from '../../../store/slices/personalDataSlice';
import { FONT_FAMILY, palette } from '../../../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';

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
    screen: {
      flex: 1,
      paddingHorizontal: 16,
    },
    contentContainer: {
      flexGrow: 1,
      width: '100%',
    },
    content: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      paddingTop: 20,
    },
    screenTitle: {
      letterSpacing: 0.9,
      color: colors.text,
    },
    subtitle: {
      marginTop: 8,
      marginBottom: 24,
      letterSpacing: 0.4,
      color: colors.text,
      fontFamily: FONT_FAMILY.regular,
    },
    warningIcon: {
      alignItems: 'center',
      width: '100%',
      marginBottom: 16,
    },
    otpSection: {
      width: '100%',
      marginTop: 8,
    },
    resendContainer: {
      alignItems: 'center',
      width: '100%',
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
    actionButton: {
      marginBottom: TAB_BAR_BOTTOM_OFFSET + 10,
      marginTop: 30,
    },
  });

export function ConfirmPhoneCodeScreen() {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const route = useRoute();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const { logout } = useAuthSession();
  const phoneNumber = route.params?.phoneNumber ?? '';
  const isDeleteAccount = route.params?.purpose === 'delete_account';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const {
    code: otpCode,
    isComplete,
    reset: resetOtp,
    inputProps: otpInputProps,
  } = useOtpInput();

  const displayPhone = formatPhoneForDisplay(phoneNumber);
  const isActionDisabled = isSubmitting || !isComplete;

  const handleVerifyCode = async () => {
    if (otpCode.length !== 6) {
      showToast({
        title: 'Սխալ կոդ',
        body: 'Մուտքագրեք 6 նիշանոց կոդը',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await smsApi.verifyCode({ phoneNumber, code: otpCode });
      dispatch(setPhoneVerified(phoneNumber));

      try {
        await dispatch(fetchPersonalData()).unwrap();
      } catch {
        // Local verified flag stays; next screen load can refresh personal data.
      }

      try {
        const { data } = await userApi.getMe();
        dispatch(
          setUserFlags({
            hasSignature: Boolean(data?.hasSignature),
            isPhoneVerified: Boolean(data?.isPhoneVerified),
          }),
        );
      } catch {
        // Flags already set via setPhoneVerified above.
      }

      showToast({
        title: 'Հեռախոսահամարը հաստատված է',
        type: 'success',
      });
      navigation.goBack();
    } catch (error) {
      showToast({
        title: 'Հաստատումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (otpCode.length !== 6) {
      showToast({
        title: 'Սխալ կոդ',
        body: 'Մուտքագրեք 6 նիշանոց կոդը',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await accountApi.deleteAccount({ code: otpCode });
      showToast({
        title: 'Հաշիվը ջնջված է',
        body: 'Ձեր հաշիվը հաջողությամբ ջնջվել է',
        type: 'success',
      });
      await logout({ skipApi: true });
    } catch (error) {
      showToast({
        title: 'Ջնջումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
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
    <FormScrollView
      style={[globalStyles.screen, styles.screen]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
        {isDeleteAccount ? (
          <View style={styles.warningIcon}>
            <WarningSvg width={45} height={45} fill={palette.red} />
          </View>
        ) : null}
        <Typography variant="h4" style={styles.screenTitle}>
          {isDeleteAccount ? 'Հաստատեք հաշվի ջնջումը' : 'Հաստատման կոդ'}
        </Typography>
        <Typography variant="h6" style={styles.subtitle}>
          {isDeleteAccount
            ? 'Մուտքագրեք Ձեր էլ-փոստին ուղարկված կոդը՝ հաշիվը ջնջելու համար'
            : `Մուտքագրեք Ձեր 0${displayPhone} հեռախոսահամարին ուղարկված կոդը`}
        </Typography>
        <View style={styles.otpSection}>
          <OtpInputRowCode {...otpInputProps} />
        </View>
        {!isDeleteAccount ? (
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
        ) : null}
      </AnimatedView>
      <AuthButton
        title={isDeleteAccount ? 'Ջնջել' : 'Հաստատել հեռախոսահամարը'}
        onPress={isDeleteAccount ? handleDeleteAccount : handleVerifyCode}
        isLoading={isSubmitting}
        disabled={isActionDisabled}
        style={styles.actionButton}
      />
    </FormScrollView>
  );
}
