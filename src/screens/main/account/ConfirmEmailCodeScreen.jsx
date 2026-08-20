import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AnimatedView, FormScrollView, Typography } from '../../../components';
import AuthButton from '../../../components/buttons/AuthButton';
import { OtpInputRowCode } from '../../authScreens/signInUP/components/OtpInputRowCode';
import { authApi, userApi } from '../../../api';
import {
  useGlobalStyles,
  useOtpInput,
  useTemporaryFocusStatusBar,
  useThemedStyles,
  useToast,
} from '../../../hooks';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchPersonalData,
  selectPersonalData,
  setUserFlags,
} from '../../../store/slices/personalDataSlice';
import { FONT_FAMILY } from '../../../theme';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';
import {
  formatSmsResendCountdown,
  getSmsResendRemainingSeconds,
  SMS_RESEND_COOLDOWN_MS,
  startSmsResendCooldown,
} from '../../../utils/smsResendCooldown';

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
    resendCountdown: {
      fontSize: 12,
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.icons,
      letterSpacing: 0.6,
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

export function ConfirmEmailCodeScreen() {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const route = useRoute();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const personalData = useAppSelector(selectPersonalData);
  const email = route.params?.email ?? personalData?.email ?? '';

  useTemporaryFocusStatusBar();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const {
    code: otpCode,
    isComplete,
    reset: resetOtp,
    inputProps: otpInputProps,
  } = useOtpInput();

  const isActionDisabled = isSubmitting || !isComplete;
  const canResend = remainingSeconds === 0;

  useEffect(() => {
    if (!email) {
      return undefined;
    }

    let isMounted = true;
    let intervalId;

    const syncRemaining = async () => {
      const remaining = await getSmsResendRemainingSeconds(email);
      if (isMounted) {
        setRemainingSeconds(remaining);
      }
    };

    syncRemaining();
    intervalId = setInterval(syncRemaining, 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [email]);

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
      await authApi.verifyEmailOtp({
        email,
        code: otpCode,
      });
      dispatch(setUserFlags({ isEmailVerified: true }));

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
            isEmailVerified: Boolean(data?.isEmailVerified),
            hasNotificationAddress: Boolean(data?.hasNotificationAddress),
          }),
        );
      } catch {
        // Flags already set via setUserFlags above.
      }

      showToast({
        title: 'Էլ.-փոստը հաստատված է',
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

  const handleResendCode = async () => {
    if (!canResend || isResending) {
      return;
    }

    setIsResending(true);
    try {
      await authApi.sendEmailOtp({ email });
      await startSmsResendCooldown(email);
      setRemainingSeconds(Math.ceil(SMS_RESEND_COOLDOWN_MS / 1000));
      resetOtp();
      showToast({
        title: 'Կոդը ուղարկված է',
        body: 'Նոր հաստատման կոդը ուղարկվել է ձեր էլ.-փոստին',
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
        <Typography variant="h4" style={styles.screenTitle}>
          Հաստատման կոդ
        </Typography>
        <Typography variant="h6" style={styles.subtitle}>
          {`Մուտքագրեք Ձեր (${email}) էլ.-փոստին ուղարկված կոդը`}
        </Typography>
        <View style={styles.otpSection}>
          <OtpInputRowCode {...otpInputProps} />
        </View>
        <View style={styles.resendContainer}>
          <Typography style={styles.resendHelper}>Չե՞ք ստացել կոդը</Typography>
          {remainingSeconds === null ? null : canResend ? (
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
          ) : (
            <Typography style={styles.resendCountdown}>
              {formatSmsResendCountdown(remainingSeconds)}
            </Typography>
          )}
        </View>
      </AnimatedView>
      <AuthButton
        title="Հաստատել էլ.-փոստը"
        onPress={handleVerifyCode}
        isLoading={isSubmitting}
        disabled={isActionDisabled}
        style={styles.actionButton}
      />
    </FormScrollView>
  );
}
