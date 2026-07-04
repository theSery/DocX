import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { FONT_FAMILY, palette } from '../../../../theme';
import { FormField, Typography } from '../../../../components';
import AuthButton from '../../../../components/buttons/AuthButton';
import GradientButton from '../../../../components/buttons/GradientButton';
import MailIconSvg from '../../../../components/icons/MailIconSvg';
import LockIconSbg from '../../../../components/icons/LockIconSbg';
import PhoneSvg from '../../../../components/icons/PhoneSvg';
import bg from '../../../../assets/images/bg.webp';
import { OtpInputRowCode } from './OtpInputRowCode';
import { authApi, persistAuthResponse, smsApi } from '../../../../api';
import { useAuthSession } from '../../../../hooks';
import { useToast } from '../../../../hooks';
import { saveUserCredentials } from '../../../../utils/secureStorage';
const INPUT_RADIUS = 16;

const OTP_BOX_SIZE = 48;
const OTP_BORDER_COLOR = '#B8C4D9';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(\+374\d{8})$/;

const LOGIN_TITLES = {
  mail: 'ՄՈՒՏՔ ԷԼ-ՓՈՍՏՈՎ',
  phone: 'ՄՈՒՏՔ ՀԵՌԱԽՈՍԱՀԱՄԱՐՈՎ',
  phoneOtp: 'ՀԵՌԱԽՈՍԱՀԱՄԱՐԻ ՀԱՍՏԱՏՈՒՄ',
};
const SCREEN_HEIGHT = Dimensions.get('window').height / 2.2;
const FADE_OUT_MS = 160;
const FADE_IN_MS = 220;

function OrDivider() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Typography style={styles.dividerText}>Կամ</Typography>
      <View style={styles.dividerLine} />
    </View>
  );
}

function OutlineButton({ title, onPress, icon }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.outlineButton,
        pressed && styles.buttonPressed,
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

function OtpInputRow({ digits, onChangeDigit, focusedIndex, onFocusIndex }) {
  return (
    <OtpInputRowCode
      digits={digits}
      onChangeDigit={onChangeDigit}
      focusedIndex={focusedIndex}
      onFocusIndex={onFocusIndex}
    />
  );
}

function PhoneOtpVerification({ phoneNumber, handleTabPress, onResendCode }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { login } = useAuthSession();
  const { showToast } = useToast();

  const handleChangeDigit = (index, value) => {
    setDigits(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleVerifyCode = async () => {
    const code = digits.join('');
    if (code.length !== 6) {
      showToast({
        title: 'Սխալ կոդ',
        body: 'Մուտքագրեք 6 նիշանոց կոդը',
        type: 'error',
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await smsApi.verifyCode({ phoneNumber, code });
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
      setDigits(['', '', '', '', '', '']);
      setFocusedIndex(0);
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

        <OtpInputRow
          digits={digits}
          onChangeDigit={handleChangeDigit}
          focusedIndex={focusedIndex}
          onFocusIndex={setFocusedIndex}
        />

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
            icon={<MailIconSvg width={19} height={15} />}
          />
        </View>
      </>
    </View>
  );
}

function MailLogin({ handleTabPress }) {
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
        // email: values.email,
        // password: values.password,
        //    email: 'girebic328@fixscal.com',
        // password: 'Ser1288642',
        email: 'lawyerhovhannisyan@gmail.com',
        password: 'PassDoc10!',
      });
      await persistAuthResponse(response);
      await saveUserCredentials({ email: 'girebic328@fixscal.com', password: 'Ser1288642', pinCode: '1111' });
      await login();
    } catch (error) {
      showToast({
        title: 'Մուտք ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    }
  });

  return (
    <View style={{ justifyContent: 'space-between', height: SCREEN_HEIGHT }}>
      <>
        <View style={{ marginBottom: 0 }}>
          <FormField
            control={control}
            name="email"
            label="Էլ.-փոստ"
            placeholder="example@docx.am"
            startIcon={<MailIconSvg width={19} height={15} />}
            // rules={{
            //   required: 'Էլ.-փոստը պարտադիր է',
            //   pattern: {
            //     value: EMAIL_PATTERN,
            //     message: 'Մուտքագրեք վավեր էլ.-փոստ',
            //   },
            // }}
          />
        </View>
        <View style={{ marginBottom: 0 }}>
          <FormField
            control={control}
            name="password"
            label="Գաղտնաբառ"
            placeholder="********"
            startIcon={<LockIconSbg width={17} height={19} />}
            secureTextEntry
            // rules={{
            //   required: 'Գաղտնաբառը պարտադիր է',
            //   minLength: { value: 6, message: 'Առնվազն 6 նիշ' },
            // }}
          />
          <Pressable style={styles.forgotLink} hitSlop={8}>
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
            icon={<PhoneSvg width={20} height={20} fill={palette.mainBlue} />}
          />
        </View>
      </>
    </View>
  );
}

function PhoneLogin({ handleTabPress, onSendCode }) {
  const [isSending, setIsSending] = useState(false);
  const { control, handleSubmit } = useForm({
    defaultValues: { phone: '' },
    mode: 'onBlur',
  });

  const handleSendCode = handleSubmit(async values => {
    setIsSending(true);
    try {
      await onSendCode(values.phone);
    } finally {
      setIsSending(false);
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
        placeholderTextColor={palette.lightGray}
        startIcon={<PhoneSvg width={20} height={20} fill={palette.mainBlue} />}
        rules={{
          required: 'Հեռախոսահամարը պարտադիր է',
          pattern: {
            value: PHONE_PATTERN,
            message: 'Մուտքագրեք վավեր հեռախոսահամար',
          },
        }}
      />

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            (pressed || isSending) && styles.buttonPressed,
            isSending && styles.primaryButtonDisabled,
          ]}
          onPress={handleSendCode}
          disabled={isSending}
        >
          <GradientButton height={45} isLight={false}>
            <Typography variant="h5" style={styles.primaryButtonText}>
              {isSending ? 'Ուղարկվում է...' : 'Ուղարկել կոդը'}
            </Typography>
          </GradientButton>
        </Pressable>
        <OrDivider />
        <OutlineButton
          title="Մուտք էլեկտրոնային փոստով"
          onPress={() => handleTabPress('mail')}
          icon={<MailIconSvg width={19} height={15} />}
        />
        <Image source={bg} resizeMode="cover" style={styles.bg} />
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
      return <MailLogin handleTabPress={handleTabPress} />;
    case 'phone':
      return (
        <PhoneLogin handleTabPress={handleTabPress} onSendCode={onSendCode} />
      );
    default:
      return null;
  }
}

export function LoginTabs({ onPhoneLogin }) {
  const [activeTab, setActiveTab] = useState('mail');
  const [phoneStep, setPhoneStep] = useState('entry');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { showToast } = useToast();
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;

  const loginTitle =
    activeTab === 'phone' && phoneStep === 'otp'
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

  const handleTabPress = useCallback(
    tab => {
      if (tab === activeTab) {
        return;
      }

      setPhoneStep('entry');
      setPhoneNumber('');

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
    [activeTab, contentOpacity, contentTranslateY],
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
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: palette.mainBlue,
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
    color: palette.white,
    letterSpacing: 1.2,
  },
  outlineButton: {
    height: 45,
    borderRadius: INPUT_RADIUS,
    borderWidth: 1,
    borderColor: palette.mainBlue,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  outlineButtonText: {
    width: '80%',
    textAlign: 'center',
    color: palette.mainBlue,
    letterSpacing: 2,
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
    backgroundColor: palette.gray,
  },
  dividerText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.regular,
    color: palette.lightGray,
  },
  loginTitle: {
    fontFamily: FONT_FAMILY.medium,
    letterSpacing: 1.2,
    // marginBottom: 4,
    textAlign: 'center',
    marginBottom: 20,
  },
  otpSubtitle: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.regular,
    color: palette.gray,
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
    borderColor: OTP_BORDER_COLOR,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFocused: {
    borderColor: palette.mainBlue,
    borderWidth: 1.5,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 20,
    fontFamily: FONT_FAMILY.semiBold,
    color: palette.black,
    padding: 0,
  },
  otpInputPlaceholder: {
    fontFamily: FONT_FAMILY.regular,
    color: palette.lightGray,
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
    color: palette.gray,
  },
  resendLink: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.semiBold,
    color: palette.mainBlue,
    textDecorationLine: 'underline',
  },
  bg: {
    width: '100%',
    height: 161,
    marginTop: 20,
  },
});
