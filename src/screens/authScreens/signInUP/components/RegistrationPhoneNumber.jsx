import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { FONT_FAMILY } from '../../../../theme';
import { FormField, Typography } from '../../../../components';
import AuthButton from '../../../../components/buttons/AuthButton';
import MailIconSvg from '../../../../components/icons/MailIconSvg';
import LockIconSbg from '../../../../components/icons/LockIconSbg';
import PhoneSvg from '../../../../components/icons/PhoneSvg';
import { OtpInputRowCode } from './OtpInputRowCode';
import { RegistrationPrivacyText } from './RegistrationPrivacyText';
import { authApi } from '../../../../api';
import {
  useOtpInput,
  useTheme,
  useThemedStyles,
  useToast,
} from '../../../../hooks';
import {
  PASSWORD_STRENGTH_RULE,
  PHONE_NUMBER_PATTERN,
} from '../../../../utils/patterns';
import {
  formatSmsResendCountdown,
  getSmsResendRemainingSeconds,
  SMS_RESEND_COOLDOWN_MS,
  startSmsResendCooldown,
} from '../../../../utils/smsResendCooldown';

const PHONE_PATTERN = PHONE_NUMBER_PATTERN;
const PHONE_REGISTER_PURPOSE = 'register';
const SCREEN_HEIGHT = Dimensions.get('window').height / 2;
const INPUT_RADIUS = 16;

function OrDivider() {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Typography style={styles.dividerText}>Կամ</Typography>
      <View style={styles.dividerLine} />
    </View>
  );
}


function PhonePasswordForm({ phoneNumber }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const {
    control,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(values => {
    navigation.navigate('Registration', {
      phoneNumber,
      password: values.password,
    });
  });

  return (
    <View
      style={[
        styles.form,
        { height: SCREEN_HEIGHT, justifyContent: 'space-between' },
      ]}
    >
      <>
        <Typography variant="h4" style={styles.loginTitle}>
          ՍՏԵՂԾԵԼ ՆՈՐ ՀԱՇԻՎ
        </Typography>
        <View style={{ marginVertical: 20 }}>
          <FormField
            control={control}
            name="password"
            label="Ստեղծել նոր գաղտնաբառ *"
            placeholder="********"
            startIcon={<LockIconSbg width={17} height={19} fill={colors.icons} />}
            secureTextEntry
            rules={{
              required: 'Գաղտնաբառը պարտադիր է',
              ...PASSWORD_STRENGTH_RULE,
            }}
          />
        </View>
        <FormField
          control={control}
          name="confirmPassword"
          label="Կրկնել գաղտնաբառը *"
          placeholder="********"
          startIcon={<LockIconSbg width={17} height={19} fill={colors.icons} />}
          secureTextEntry
          rules={{
            required: 'Կրկնեք գաղտնաբառը',
            validate: value =>
              value === getValues('password') || 'Գաղտնաբառերը չեն համընկնում',
          }}
        />
      </>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <RegistrationPrivacyText />
        <AuthButton
          title="Գրանցվել"
          onPress={onSubmit}
          isLoading={isSubmitting}
        />
      </View>
    </View>
  );
}

function PhoneOtpVerification({ phoneNumber, onSwitchToMail }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const {
    code: otpCode,
    isComplete,
    reset: resetOtp,
    inputProps: otpInputProps,
  } = useOtpInput();

  const canResend = remainingSeconds === 0;
  const isActionDisabled = isVerifying || !isComplete;

  useEffect(() => {
    if (!phoneNumber) {
      return undefined;
    }

    let isMounted = true;
    let intervalId;

    const syncRemaining = async () => {
      const remaining = await getSmsResendRemainingSeconds(phoneNumber);
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
  }, [phoneNumber]);

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
      const response = await authApi.verifyPhoneOtp({
        phoneNumber,
        purpose: PHONE_REGISTER_PURPOSE,
        code: otpCode,
      });
      console.log('Verify phone OTP response:', response.data);
      showToast({
        title: 'Հեռախոսահամարը հաստատված է',
        body: response?.data?.message ?? 'Կոդը հաջողությամբ հաստատված է',
        type: 'success',
      });
      setIsVerified(true);
    } catch (error) {
      console.log('Verify phone OTP error:', error);
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
    if (!canResend || isResending) {
      return;
    }

    setIsResending(true);
    try {
      await authApi.sendPhoneOtp({
        phoneNumber,
        purpose: PHONE_REGISTER_PURPOSE,
      });
      await startSmsResendCooldown(phoneNumber);
      setRemainingSeconds(Math.ceil(SMS_RESEND_COOLDOWN_MS / 1000));
      resetOtp();
      showToast({
        title: 'Կոդը ուղարկված է',
        body: 'Նոր հաստատման կոդը ուղարկվել է ձեր հեռախոսահամարին',
        type: 'success',
      });
    } catch (error) {
      console.log('Resend phone OTP error:', error);
      showToast({
        title: 'Ուղարկումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return <PhonePasswordForm phoneNumber={phoneNumber} />;
  }

  return (
    <View
      style={[
        styles.form,
        { height: SCREEN_HEIGHT, justifyContent: 'space-between' },
      ]}
    >
      <>
        <Typography variant="h4" style={styles.loginTitle}>
          ՀԵՌԱԽՈՍԱՀԱՄԱՐԻ ՀԱՍՏԱՏՈՒՄ
        </Typography>
        <Typography style={styles.otpSubtitle}>{phoneNumber}</Typography>
        <OtpInputRowCode {...otpInputProps} />
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
      </>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <AuthButton
          title="Հաստատել կոդը"
          onPress={handleVerifyCode}
          isLoading={isVerifying}
          disabled={isActionDisabled}
        />
        {/* <OrDivider />
        <OutlineButton
          title="Գրանցում էլեկտրոնային փոստով"
          onPress={onSwitchToMail}
          icon={<MailIconSvg width={19} height={15} fill={colors.icons} />}
        /> */}
      </View>
    </View>
  );
}

export function RegistrationPhoneNumber({ onSwitchToMail }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitError, setSubmitError] = useState('');
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { phone: '' },
    mode: 'onBlur',
  });
  const isLoading = isSubmitting;
  const phoneValue = watch('phone');

  useEffect(() => {
    setSubmitError('');
  }, [phoneValue]);

  const onSubmit = handleSubmit(async values => {
    setSubmitError('');
    try {
      const response = await authApi.sendPhoneOtp({
        phoneNumber: values.phone,
        purpose: PHONE_REGISTER_PURPOSE,
      });
      console.log('Send phone OTP response:', response.data);
      await startSmsResendCooldown(values.phone);
      setPhoneNumber(values.phone);
      showToast({
        title: 'Կոդը ուղարկված է',
        body: 'Հաստատման կոդը ուղարկվել է ձեր հեռախոսահամարին',
        type: 'success',
      });
    } catch (error) {
      console.log('Send phone OTP error:', error);
      setSubmitError(error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։');
    }
  });

  if (phoneNumber) {
    return (
      <PhoneOtpVerification
        phoneNumber={phoneNumber}
        onSwitchToMail={onSwitchToMail}
      />
    );
  }

  return (
    <View
      style={[
        styles.form,
        { height: SCREEN_HEIGHT, justifyContent: 'space-between' },
      ]}
    >
      <>
        <Typography variant="h4" style={styles.loginTitle}>
          ԳՐԱՆՑՈՒՄ ՀԵՌԱԽՈՍԱՀԱՄԱՐՈՎ
        </Typography>
        <FormField
          control={control}
          name="phone"
          label="Հեռախոսահամար"
          keyboardType="phone-pad"
          placeholder="91 123 456"
          placeholderTextColor={colors.textDisabled}
          startIcon={<PhoneSvg width={20} height={20} fill={colors.icons} />}
          rules={{
            required: 'Հեռախոսահամարը պարտադիր է',
            pattern: {
              value: PHONE_PATTERN,
              message: 'Մուտքագրեք վավեր հեռախոսահամար',
            },
          }}
        />
        {submitError ? (
          <Typography style={styles.errorText}>{submitError}</Typography>
        ) : null}
      </>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <RegistrationPrivacyText />
        <AuthButton
          title="Ուղարկել կոդը"
          onPress={onSubmit}
          isLoading={isLoading}
        />

      </View>
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    form: {
      marginTop: 20,
    },
    loginTitle: {
      fontFamily: FONT_FAMILY.medium,
      letterSpacing: 1.2,
      textAlign: 'center',
      marginBottom: 20,
    },
    errorText: {
      fontSize: 12,
      fontFamily: FONT_FAMILY.regular,
      color: colors.error,
      marginTop: 4,
    },
    otpSubtitle: {
      fontSize: 13,
      fontFamily: FONT_FAMILY.regular,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
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
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 30,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.textSecondary,
    },
    dividerText: {
      fontSize: 13,
      fontFamily: FONT_FAMILY.regular,
      color: colors.textDisabled,
    },
    outlineButton: {
      height: 45,
      borderRadius: INPUT_RADIUS,
      borderWidth: 1,
      borderColor: colors.icons,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
    },
    outlineButtonText: {
      textAlign: 'center',
      color: colors.icons,
    },
    buttonPressed: {
      opacity: 0.88,
    },
  });
