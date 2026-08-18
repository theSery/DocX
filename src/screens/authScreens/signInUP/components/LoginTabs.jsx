import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { FONT_FAMILY } from '../../../../theme';
import { FormField, Typography } from '../../../../components';
import AuthButton from '../../../../components/buttons/AuthButton';
import GradientButton from '../../../../components/buttons/GradientButton';
import MailIconSvg from '../../../../components/icons/MailIconSvg';
import LockIconSbg from '../../../../components/icons/LockIconSbg';
import PhoneSvg from '../../../../components/icons/PhoneSvg';
import bg from '../../../../assets/images/bg.webp';
import { OtpInputRowCode } from './OtpInputRowCode';
import { authApi, persistAuthResponse, smsApi } from '../../../../api';
import { useAuthSession, useOtpInput, useTheme, useThemedStyles, useToast } from '../../../../hooks';
import { saveUserCredentials } from '../../../../utils/secureStorage';
import { PASSWORD_STRENGTH_RULE } from '../../../../utils/patterns';
import {
  formatSmsResendCountdown,
  getSmsResendRemainingSeconds,
  SMS_RESEND_COOLDOWN_MS,
  startSmsResendCooldown,
} from '../../../../utils/smsResendCooldown';
const INPUT_RADIUS = 16;

const OTP_BOX_SIZE = 48;
const OTP_BORDER_COLOR = '#B8C4D9';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(\+374\d{8})$/;

const LOGIN_TITLES = {
  mail: 'ՄՈՒՏՔ ԷԼ-ՓՈՍՏՈՎ',
  phone: 'ՄՈՒՏՔ ՀԵՌԱԽՈՍԱՀԱՄԱՐՈՎ',
  phoneOtp: 'ՀԵՌԱԽՈՍԱՀԱՄԱՐԻ ՀԱՍՏԱՏՈՒՄ',
  resetPassword: 'ՎԵՐԱԿԱՆԳՆԵԼ ԳԱՂՏՆԱԲԱՌԸ',
};
const SCREEN_HEIGHT = Dimensions.get('window').height / 2.2;
const FADE_OUT_MS = 160;
const FADE_IN_MS = 220;

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

function OutlineButton({ title, onPress, icon }) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.outlineButton,
        pressed && styles.buttonPressed,
        { justifyContent: 'center' },
      ]}
      onPress={onPress}
    >
      {icon}
      <Typography variant="h5" style={styles.outlineButtonText}>
        {title}
      </Typography>
    </Pressable>
  );
}

function PhoneOtpVerification({ phoneNumber, handleTabPress, onResendCode }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const {
    code: otpCode,
    reset: resetOtp,
    inputProps: otpInputProps,
  } = useOtpInput();
  const { login } = useAuthSession();
  const { showToast } = useToast();

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
      const response = await smsApi.verifyCode({ phoneNumber, code: otpCode });
      console.log('Verify SMS code response:', response.data);
      await persistAuthResponse(response);
      await login();
    } catch (error) {
      console.log('Verify SMS code error:', error);
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
      await onResendCode();
      resetOtp();
      showToast({
        title: 'Կոդը ուղարկված է',
        body: 'Նոր հաստատման կոդը ուղարկվել է ձեր հեռախոսահամարին',
        type: 'success',
      });
    } catch (error) {
      console.log('Resend SMS code error:', error);
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
    <View style={{ justifyContent: 'space-between', height: SCREEN_HEIGHT }}>
      <>
        <Typography style={styles.otpSubtitle}>{phoneNumber}</Typography>

        <OtpInputRowCode {...otpInputProps} />

        <View style={styles.resendRow}>
          <Typography style={styles.resendHelper}>Չստացե՞լ եք կոդը</Typography>
          <Pressable hitSlop={8} onPress={handleResendCode} disabled={isResending}>
            <Typography style={styles.resendLink}>
              {isResending ? 'Ուղարկվում է...' : 'Ուղարկել կրկին'}
            </Typography>
          </Pressable>
        </View>
      </>
      <>
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isVerifying) && styles.buttonPressed,
              isVerifying && styles.primaryButtonDisabled,
            ]}
            onPress={handleVerifyCode}
            disabled={isVerifying}
          >
            <GradientButton height={45} isLight={false}>
              <Typography variant="h5" style={styles.primaryButtonText}>
                {isVerifying ? 'Ստուգվում է...' : 'Հաստատել կոդը'}
              </Typography>
            </GradientButton>
          </Pressable>
          <OrDivider />
          <OutlineButton
            title="Մուտք Էլեկտրոնային փոստով"
            onPress={() => handleTabPress('mail')}
            icon={<MailIconSvg width={19} height={15} fill={colors.icons} />}
          />
        </View>
      </>
    </View>
  );
}

function MailLogin({ handleTabPress, isResetPassword, onForgotPassword }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });
  const { login } = useAuthSession();
  const { showToast } = useToast();
  const isLoading = isSubmitting;

  const handleSignIn = handleSubmit(async values => {
    try {
      const response = await authApi.login({
        email: values.email,
        password: values.password,
      });
      await persistAuthResponse(response);
      await saveUserCredentials({ email: values.email, password: values.password });
      const payload = response?.data?.data ?? response?.data;
      showToast({
        title: 'Մուտքը հաջողությամբ կատարվեց',
        body: response?.data?.message ?? payload?.message ?? 'Բարի գալուստ',
        type: 'success',
      });
      await login();
    } catch (error) {
      showToast({
        title: 'Մուտք ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    }
  });

  const handleSendResetCode = handleSubmit(async values => {
    try {
      await authApi.sendOtp({
        email: values.email,
        purpose: 'reset_password',
      });
      showToast({
        title: 'Կոդը ուղարկված է',
        body: `${values.email} էլ-փոստին ուղարկված կոդը`,
        type: 'success',
      });
      navigation.navigate('EmailVerification', {
        email: values.email,
        purpose: 'reset_password',
      });
    } catch (error) {
      showToast({
        title: 'Ուղարկումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    }
  });

  if (isResetPassword) {
    return (
      <View style={{ justifyContent: 'space-between', height: SCREEN_HEIGHT }}>
        <View style={{ marginBottom: 0 }}>
          <FormField
            control={control}
            name="email"
            label="Էլ.-փոստ"
            placeholder="example@docx.am"
            startIcon={<MailIconSvg width={19} height={15} fill={colors.icons} />}
            rules={{
              required: 'Էլ.-փոստը պարտադիր է',
              pattern: {
                value: EMAIL_PATTERN,
                message: 'Մուտքագրեք վավեր էլ.-փոստ',
              },
            }}
          />
        </View>

        <View style={styles.actions}>
          <AuthButton
            title="Ուղարկել կոդը էլ-փոստին"
            onPress={handleSendResetCode}
            isLoading={isLoading}
            borderRadius={INPUT_RADIUS}
          />
          <OrDivider />
          <OutlineButton
            title="Մուտք հեռախոսահամարով"
            onPress={() => handleTabPress('phone')}
            icon={<PhoneSvg width={20} height={20} fill={colors.icons} />}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ justifyContent: 'space-between', height: SCREEN_HEIGHT }}>
      <>
        <View style={{ marginBottom: 0 }}>
          <FormField
            control={control}
            name="email"
            label="Էլ.-փոստ"
            placeholder="example@docx.am"
            startIcon={<MailIconSvg width={19} height={15} fill={colors.icons} />}
            rules={{
              required: 'Էլ.-փոստը պարտադիր է',
              pattern: {
                value: EMAIL_PATTERN,
                message: 'Մուտքագրեք վավեր էլ.-փոստ',
              },
            }}
          />
        </View>
        <View style={{ marginBottom: 0 }}>
          <FormField
            control={control}
            name="password"
            label="Գաղտնաբառ"
            placeholder="********"
            startIcon={<LockIconSbg width={17} height={19} fill={colors.icons} />}
            secureTextEntry
            rules={{
              required: 'Գաղտնաբառը պարտադիր է',
              minLength: { value: 6, message: 'Առնվազն 6 նիշ' },
            }}
          />
          <Pressable style={styles.forgotLink} hitSlop={8} onPress={onForgotPassword}>
            <Typography style={styles.forgotLinkText}>
              Մոռացե՞լ եք գաղտնաբառը
            </Typography>
          </Pressable>
        </View>
      </>

      <>
        <View style={styles.actions}>
          <AuthButton
            title="Մուտք գործել"
            onPress={handleSignIn}
            isLoading={isLoading}
            borderRadius={INPUT_RADIUS}
          />
          <OrDivider />
          <OutlineButton
            title="Մուտք հեռախոսահամարով"
            onPress={() => handleTabPress('phone')}
            icon={<PhoneSvg width={20} height={20} fill={colors.icons} />}
          />
        </View>
      </>
    </View>
  );
}

function PhoneResetRequest({ defaultPhone, handleTabPress, onCodeSent }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { phone: defaultPhone || '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(async values => {
    try {
      const response = await authApi.sendPhoneOtp({
        phoneNumber: values.phone,
        purpose: 'reset_password',
      });
      console.log('Send phone reset OTP response:', response.data);
      await startSmsResendCooldown(values.phone);
      showToast({
        title: 'Կոդը ուղարկված է',
        body: 'Հաստատման կոդը ուղարկվել է ձեր հեռախոսահամարին',
        type: 'success',
      });
      onCodeSent(values.phone);
    } catch (error) {
      console.log('Send phone reset OTP error:', error);
      showToast({
        title: 'Ուղարկումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    }
  });

  return (
    <View style={{ justifyContent: 'space-between', height: SCREEN_HEIGHT }}>
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

      <View style={styles.actions}>
        <AuthButton
          title="Ուղարկել կոդը"
          onPress={onSubmit}
          isLoading={isSubmitting}
          borderRadius={INPUT_RADIUS}
        />
        <OrDivider />
        <OutlineButton
          title="Մուտք էլեկտրոնային փոստով"
          onPress={() => handleTabPress('mail')}
          icon={<MailIconSvg width={19} height={15} fill={colors.icons} />}
        />
      </View>
    </View>
  );
}

function PhoneResetOtp({ phoneNumber, handleTabPress, onVerified }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
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
        code: otpCode,
        purpose: 'reset_password',
      });
      console.log('Verify phone reset OTP response:', response.data);
      showToast({
        title: 'Հեռախոսահամարը հաստատված է',
        body: response?.data?.message ?? 'Կոդը հաջողությամբ հաստատված է',
        type: 'success',
      });
      onVerified();
    } catch (error) {
      console.log('Verify phone reset OTP error:', error);
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
        purpose: 'reset_password',
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
      console.log('Resend phone reset OTP error:', error);
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
    <View style={{ justifyContent: 'space-between', height: SCREEN_HEIGHT }}>
      <>
        <Typography style={styles.otpSubtitle}>{phoneNumber}</Typography>
        <OtpInputRowCode {...otpInputProps} />
        <View style={styles.resendRow}>
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
      <View style={styles.actions}>
        <AuthButton
          title="Հաստատել կոդը"
          onPress={handleVerifyCode}
          isLoading={isVerifying}
          disabled={isActionDisabled}
          borderRadius={INPUT_RADIUS}
        />
        <OrDivider />
        <OutlineButton
          title="Մուտք էլեկտրոնային փոստով"
          onPress={() => handleTabPress('mail')}
          icon={<MailIconSvg width={19} height={15} fill={colors.icons} />}
        />
      </View>
    </View>
  );
}

function PhoneResetPassword({ phoneNumber, handleTabPress, onComplete }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const {
    control,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(async values => {
    try {
      await authApi.resetPasswordWithPhone({
        phoneNumber,
        newPassword: values.password,
      });
      showToast({
        title: 'Գաղտնաբառը հաջողությամբ փոխվեց',
        body: 'Այժմ կարող եք մուտք գործել նոր գաղտնաբառով',
        type: 'success',
      });
      onComplete();
    } catch (error) {
      showToast({
        title: 'Վերականգնումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    }
  });

  return (
    <View style={{ justifyContent: 'space-between', height: SCREEN_HEIGHT }}>
      <View>
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
        <View style={{ marginTop: 16 }}>
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
        </View>
      </View>
      <View style={styles.actions}>
        <AuthButton
          title="Պահպանել"
          onPress={onSubmit}
          isLoading={isSubmitting}
          borderRadius={INPUT_RADIUS}
        />
        <OrDivider />
        <OutlineButton
          title="Մուտք էլեկտրոնային փոստով"
          onPress={() => handleTabPress('mail')}
          icon={<MailIconSvg width={19} height={15} fill={colors.icons} />}
        />
      </View>
    </View>
  );
}

function PhoneLogin({ handleTabPress, onForgotPassword, onResetComplete }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { login } = useAuthSession();
  const { showToast } = useToast();
  const [resetStep, setResetStep] = useState(null);
  const [resetPhoneNumber, setResetPhoneNumber] = useState('');
  const {
    control,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { phone: '', password: '' },
    mode: 'onBlur',
  });
  const isLoading = isSubmitting;

  const handleSignIn = handleSubmit(async values => {
    try {
      const response = await authApi.loginWithPhone({
        phoneNumber: values.phone,
        password: values.password,
      });
      await persistAuthResponse(response);
      await saveUserCredentials({
        phoneNumber: values.phone,
        password: values.password,
      });
      const payload = response?.data?.data ?? response?.data;
      showToast({
        title: 'Մուտքը հաջողությամբ կատարվեց',
        body: response?.data?.message ?? payload?.message ?? 'Բարի գալուստ',
        type: 'success',
      });
      await login();
    } catch (error) {
      showToast({
        title: 'Մուտք ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    }
  });

  const handleForgotPassword = () => {
    setResetPhoneNumber(getValues('phone') || '');
    setResetStep('phone');
    onForgotPassword?.();
  };

  if (resetStep === 'phone') {
    return (
      <PhoneResetRequest
        defaultPhone={resetPhoneNumber}
        handleTabPress={handleTabPress}
        onCodeSent={phone => {
          setResetPhoneNumber(phone);
          setResetStep('otp');
        }}
      />
    );
  }

  if (resetStep === 'otp') {
    return (
      <PhoneResetOtp
        phoneNumber={resetPhoneNumber}
        handleTabPress={handleTabPress}
        onVerified={() => setResetStep('password')}
      />
    );
  }

  if (resetStep === 'password') {
    return (
      <PhoneResetPassword
        phoneNumber={resetPhoneNumber}
        handleTabPress={handleTabPress}
        onComplete={() => {
          setResetStep(null);
          setResetPhoneNumber('');
          onResetComplete?.();
        }}
      />
    );
  }

  return (
    <View style={{ justifyContent: 'space-between', height: SCREEN_HEIGHT }}>
      <View>
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
        <View style={{ marginTop: 16 }}>
          <FormField
            control={control}
            name="password"
            label="Գաղտնաբառ"
            placeholder="********"
            startIcon={<LockIconSbg width={17} height={19} fill={colors.icons} />}
            secureTextEntry
            rules={{
              required: 'Գաղտնաբառը պարտադիր է',
              minLength: { value: 6, message: 'Առնվազն 6 նիշ' },
            }}
          />
        </View>
        <Pressable
          style={styles.forgotLink}
          hitSlop={8}
          onPress={handleForgotPassword}
        >
          <Typography style={styles.forgotLinkText}>
            Մոռացե՞լ եք գաղտնաբառը
          </Typography>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            (pressed || isLoading) && styles.buttonPressed,
            isLoading && styles.primaryButtonDisabled,
          ]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          <GradientButton height={45} isLight={false}>
            <Typography variant="h5" style={styles.primaryButtonText}>
              {isLoading ? 'Մուտք է կատարվում...' : 'Մուտք գործել'}
            </Typography>
          </GradientButton>
        </Pressable>
        <OrDivider />
        <OutlineButton
          title="Մուտք էլեկտրոնային փոստով"
          onPress={() => handleTabPress('mail')}
          icon={<MailIconSvg width={19} height={15} fill={colors.icons} />}
        />
        {/* <Image source={bg} resizeMode="cover" style={styles.bg} /> */}
      </View>
    </View>
  );
}

function renderLoginContent(
  activeTab,
  phoneStep,
  phoneNumber,
  handleTabPress,
  onSendCode,
  onResendCode,
  isResetPassword,
  onForgotPassword,
  onResetComplete,
) {
  if (activeTab === 'phone' && phoneStep === 'otp') {
    return (
      <PhoneOtpVerification
        phoneNumber={phoneNumber}
        handleTabPress={handleTabPress}
        onResendCode={onResendCode}
      />
    );
  }

  switch (activeTab) {
    case 'mail':
      return (
        <MailLogin
          handleTabPress={handleTabPress}
          isResetPassword={isResetPassword}
          onForgotPassword={onForgotPassword}
        />
      );
    case 'phone':
      return (
        <PhoneLogin
          handleTabPress={handleTabPress}
          onForgotPassword={onForgotPassword}
          onResetComplete={onResetComplete}
        />
      );
    default:
      return null;
  }
}

export function LoginTabs({ onPhoneLogin, onActiveTabChange }) {
  const styles = useThemedStyles(createStyles);
  const [activeTab, setActiveTab] = useState('mail');
  const [phoneStep, setPhoneStep] = useState('entry');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isResetPassword, setIsResetPassword] = useState(false);
  const { showToast } = useToast();
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    onActiveTabChange?.(activeTab);
  }, [activeTab, onActiveTabChange]);

  const loginTitle =
    isResetPassword
      ? LOGIN_TITLES.resetPassword
      : activeTab === 'phone' && phoneStep === 'otp'
        ? LOGIN_TITLES.phoneOtp
        : LOGIN_TITLES[activeTab];

  const requestSmsCode = useCallback(async number => {
    const response = await smsApi.requestCode({ phoneNumber: number });
    console.log('Request SMS code response:', response.data);
    return response;
  }, []);

  const handleSendCode = useCallback(
    async number => {
      try {
        await requestSmsCode(number);
        setPhoneNumber(number);
        setPhoneStep('otp');
        onPhoneLogin?.();
        showToast({
          title: 'Կոդը ուղարկված է',
          body: 'Հաստատման կոդը ուղարկվել է ձեր հեռախոսահամարին',
          type: 'success',
        });
      } catch (error) {
        console.log('Request SMS code error:', error);
        showToast({
          title: 'Ուղարկումը ձախողվեց',
          body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
          type: 'error',
        });
        throw error;
      }
    },
    [onPhoneLogin, requestSmsCode, showToast],
  );

  const handleResendCode = useCallback(async () => {
    if (!phoneNumber) {
      return;
    }
    await requestSmsCode(phoneNumber);
  }, [phoneNumber, requestSmsCode]);

  const handleForgotPassword = useCallback(() => {
    setIsResetPassword(true);
  }, []);

  const handleResetComplete = useCallback(() => {
    setIsResetPassword(false);
  }, []);

  const handleTabPress = useCallback(
    tab => {
      if (tab === activeTab && !isResetPassword) {
        return;
      }

      setPhoneStep('entry');
      setPhoneNumber('');
      setIsResetPassword(false);

      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: FADE_OUT_MS,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: -10,
          duration: FADE_OUT_MS,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) {
          return;
        }

        setActiveTab(tab);
        contentTranslateY.setValue(10);

        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: FADE_IN_MS,
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: 0,
            duration: FADE_IN_MS,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [activeTab, contentOpacity, contentTranslateY, isResetPassword],
  );

  return (
    <View style={[styles.form, styles.formTop]}>
      <Animated.View
        style={{
          height: '100%',
          opacity: contentOpacity,
          transform: [{ translateY: contentTranslateY }],
        }}
      >
        <Typography variant="h4" style={styles.loginTitle}>
          {loginTitle}
        </Typography>
        {renderLoginContent(
          activeTab,
          phoneStep,
          phoneNumber,
          handleTabPress,
          handleSendCode,
          handleResendCode,
          isResetPassword,
          handleForgotPassword,
          handleResetComplete,
        )}
      </Animated.View>
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
  form: {
    gap: 16,
  },
  formTop: {
    marginTop: 20,
    flex: 1,
    height: '100%',
  },
  actions: {
    marginTop: 20,
  },
  forgotLink: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  forgotLinkText: {
    fontSize: 8,
    fontFamily: FONT_FAMILY.semiBold,
    color: colors.icons,
    textDecorationLine: 'underline',
  },
  primaryButton: {
    height: 45,
    overflow: 'hidden',
    borderRadius: INPUT_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontFamily: FONT_FAMILY.regular,
    color: colors.buttonTextOnPrimary,
    letterSpacing: 1.2,
  },
  outlineButton: {
    height: 45,
    borderRadius: INPUT_RADIUS,
    borderWidth: 1,
    borderColor: colors.icons,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  outlineButtonText: {
    // width: '80%',
    textAlign: 'center',
    color: colors.icons,
    // letterSpacing: 2,
  },
  buttonPressed: {
    opacity: 0.88,
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
  loginTitle: {
    fontFamily: FONT_FAMILY.medium,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 20,
  },
  otpSubtitle: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    width: OTP_BOX_SIZE,
    height: OTP_BOX_SIZE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFocused: {
    borderColor: colors.icons,
    borderWidth: 1.5,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: FONT_FAMILY.semiBold,
    color: colors.text,
    padding: 0,
  },
  otpInputPlaceholder: {
    fontFamily: FONT_FAMILY.regular,
    color: colors.textDisabled,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 20,
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
  resendCountdown: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.semiBold,
    color: colors.icons,
    letterSpacing: 0.6,
  },
  disabledOpacity: {
    opacity: 0.6,
  },
  bg: {
    width: '100%',
    height: 161,
    marginTop: 20,
  },
});
