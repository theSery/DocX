import { Fragment, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGlobalStyles, useThemedFocusStatusBar, useThemedStyles, useTheme, useToast } from '../../../hooks';
import {
  AnimatedView,
  FormDateField,
  FormField,
  FormScrollView,
  Typography,
} from '../../../components';
import { useForm, useWatch } from 'react-hook-form';
import MailIconSvg from '../../../components/icons/MailIconSvg';
import UserSvg from '../../../components/icons/UserSvg';
import { FONT_FAMILY, palette } from '../../../theme';
import {
  EMAIL_PATTERN,
  ARMENIAN_NAME_RULES,
  PHONE_NUMBER_PATTERN,
} from '../../../utils/patterns';
import PhoneSvg from '../../../components/icons/PhoneSvg';
import CalendarSvg from '../../../components/icons/CalendarSvg';
import AuthButton from '../../../components/buttons/AuthButton';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchPersonalData,
  selectIsEmailVerified,
  selectIsPhoneVerified,
  selectLastVerifiedPhoneNumber,
  selectPersonalData,
  selectPersonalDataStatus,
  setUserFlags,
  updatePersonalData,
} from '../../../store/slices/personalDataSlice';
import { authApi, smsApi } from '../../../api';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';
import { startSmsResendCooldown } from '../../../utils/smsResendCooldown';

const BIRTH_DATE_RULES = {
  required: 'Ծննդյան ամսաթիվը պարտադիր է',
  validate: value => {
    if (!(value instanceof Date)) {
      return 'Ծննդյան ամսաթիվը պարտադիր է';
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return value <= today || 'Ծննդյան ամսաթիվը չի կարող լինել ապագայում';
  },
};

const CONTACT_INFO_FIELDS = [
  {
    name: 'email',
    label: 'Էլ.-փոստ *',
    Icon: MailIconSvg,
    placeholder: 'Էլ.-փոստ',
    keyboardType: 'email-address',
    rules: {
      required: 'Էլ.-փոստը պարտադիր է',
      pattern: {
        value: EMAIL_PATTERN,
        message: 'Մուտքագրեք վավեր էլ.-փոստ',
      },
    },
  },
  {
    name: 'name',
    label: 'Անուն *',
    Icon: UserSvg,
    placeholder: 'Ձեր Անունը',
    keyboardType: 'default',
    rules: ARMENIAN_NAME_RULES,
  },
  {
    name: 'lastName',
    label: 'Ազգանուն *',
    Icon: UserSvg,
    placeholder: 'Ձեր Ազգանունը',
    keyboardType: 'default',
    rules: ARMENIAN_NAME_RULES,
  },
  {
    name: 'middleName',
    label: 'Հայրանուն *',
    Icon: UserSvg,
    placeholder: 'Ձեր Հայրանուն',
    keyboardType: 'default',
    rules: ARMENIAN_NAME_RULES,
  },
];

const createStyles = colors =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 16,
      
    },
    contentContainer: {
      paddingBottom: 32,
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
    },
    formFieldContainer: {
      width: '100%',
      marginTop: 20,
      gap: 20,
    },
    primaryButton: {
      height: 45,
      overflow: 'hidden',
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      borderWidth: 1,
      borderColor: palette.mainBlue,
      marginBottom: 12,
    },
    primaryButtonText: {
      fontFamily: FONT_FAMILY.regular,
      color: palette.mainBlue,
      letterSpacing: 1.2,
    },
    buttonPressed: {
      opacity: 0.88,
    },
    phoneText: {
      fontFamily: FONT_FAMILY.semiBold,
      color: palette.mainBlue,
      letterSpacing: 1.2,
      marginTop: 8,
      fontSize: 12,
    },
  });

const EMPTY_FORM_VALUES = {
  email: '',
  name: '',
  lastName: '',
  middleName: '',
  phone: '',
  birthDate: null,
};

function mapPersonalDataToFormValues(data) {
  return {
    email: data.email ?? '',
    name: data.name ?? '',
    lastName: data.surname ?? '',
    middleName: data.patronymic ?? '',
    phone: data.phoneNumber ?? '',
    birthDate: data.birthday ? new Date(data.birthday) : null,
  };
}

function mapFormValuesToPersonalData(values) {
  return {
    name: values.name,
    surname: values.lastName,
    patronymic: values.middleName,
    phoneNumber: values.phone,
    birthday:
      values.birthDate instanceof Date ? values.birthDate.toISOString() : null,
  };
}

function resolveFormValuesAfterUpdate(submittedValues, apiData) {
  return mapPersonalDataToFormValues({
    email: submittedValues.email,
    ...mapFormValuesToPersonalData(submittedValues),
    ...(apiData ?? {}),
  });
}

export function ProfileInfoScreen() {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  useThemedFocusStatusBar({ inverted: true });
  const navigation = useNavigation();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const personalData = useAppSelector(selectPersonalData);
  const personalDataStatus = useAppSelector(selectPersonalDataStatus);
  const isPhoneVerified = useAppSelector(selectIsPhoneVerified);
  const isEmailVerified = useAppSelector(selectIsEmailVerified);
  const lastVerifiedPhoneNumber = useAppSelector(selectLastVerifiedPhoneNumber);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    trigger,
    formState: { isSubmitting, isLoading },
  } = useForm({
    defaultValues: EMPTY_FORM_VALUES,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const watchedEmail = useWatch({ control, name: 'email' }) ?? '';
  const watchedPhone = useWatch({ control, name: 'phone' }) ?? '';
  const storedPhone = personalData?.phoneNumber ?? '';
  const isPhoneChanged = watchedPhone !== storedPhone;
  const isChangedPhoneVerified =
    isPhoneChanged && lastVerifiedPhoneNumber === watchedPhone;
  const showEmailVerificationUi = !isEmailVerified;
  const showPhoneVerificationUi =
    !isPhoneVerified || (isPhoneChanged && !isChangedPhoneVerified);
  const isSaveDisabled =
    isSubmitting || (isPhoneChanged && !isChangedPhoneVerified);

  useEffect(() => {
    if (personalDataStatus !== 'succeeded' || !personalData) {
      return;
    }

    reset(mapPersonalDataToFormValues(personalData));
  }, [personalData, personalDataStatus, reset]);

  const handleSendEmailCode = async () => {
    const isEmailValid = await trigger('email');
    if (!isEmailValid) {
      return;
    }

    const email = watchedEmail;
    setIsSendingEmailCode(true);
    try {
      await authApi.sendEmailOtp({ email });
      await startSmsResendCooldown(email);
      showToast({
        title: 'Կոդը ուղարկված է',
        body: 'Հաստատման կոդը ուղարկվել է ձեր էլ.-փոստին',
        type: 'success',
      });
      navigation.navigate('ConfirmEmailCode', { email });
    } catch (error) {
      showToast({
        title: 'Ուղարկումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      setIsSendingEmailCode(false);
    }
  };

  const handleSendCode = async () => {
    const isPhoneValid = await trigger('phone');
    if (!isPhoneValid) {
      return;
    }

    const phoneNumber = watchedPhone;
    setIsSendingCode(true);
    try {
      // /sms/request-code only accepts a phone already on the user profile.
      if (isPhoneChanged) {
        await dispatch(
          updatePersonalData(mapFormValuesToPersonalData(getValues())),
        ).unwrap();
        dispatch(setUserFlags({ isPhoneVerified: false }));
      }

      await smsApi.requestCode({ phoneNumber });
      await startSmsResendCooldown(phoneNumber);
      showToast({
        title: 'Կոդը ուղարկված է',
        body: 'Հաստատման կոդը ուղարկվել է ձեր հեռախոսահամարին',
        type: 'success',
      });
      navigation.navigate('ConfirmPhoneCode');
      
    } catch (error) {
      showToast({
        title: 'Ուղարկումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const onSubmit = handleSubmit(async data => {
    try {
      const response = await dispatch(
        updatePersonalData(mapFormValuesToPersonalData(data)),
      ).unwrap();

      try {
        await dispatch(fetchPersonalData()).unwrap();
      } catch (refreshError) {
        console.log(refreshError, 'personal data refresh error');
      }

      const updatedFormValues = resolveFormValuesAfterUpdate(data, response);
      reset(updatedFormValues);
      navigation.navigate('AccountMain');
      showToast({
        title: 'Տվյալները հաջողությամբ պահպանվեցին',
        type: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Տվյալների պահպանումը ձախողվեց',
        body: error.message,
        type: 'error',
      });
    }
  });

  return (
    <FormScrollView
      style={[globalStyles.screen, styles.screen]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
        <Typography variant="h4" style={styles.screenTitle}>
          Անձնական տվյալներ
        </Typography>
        <View style={styles.formFieldContainer}>
          {CONTACT_INFO_FIELDS.map(field => (
            <Fragment key={field.name}>
              <FormField
                control={control}
                name={field.name}
                label={field.label}
                startIcon={<field.Icon fill={colors.icons} width={20} height={20} />}
                placeholder={field.placeholder}
                keyboardType={field.keyboardType}
                editable={
                  field.name === 'email' ? !isEmailVerified : field.editable
                }
                rules={field.rules}
              />
              {field.name === 'email' && showEmailVerificationUi ? (
                <View>
                  <Typography variant="h5" style={styles.phoneText}>
                    ⓘ Խնդրում ենք հաստատել էլ.-փոստը
                  </Typography>
                  <Pressable
                    onPress={handleSendEmailCode}
                    disabled={isSubmitting || isSendingEmailCode}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      (pressed || isSubmitting || isSendingEmailCode) &&
                        styles.buttonPressed,
                    ]}
                  >
                    <Typography variant="h5" style={styles.primaryButtonText}>
                      {isSendingEmailCode ? 'Ուղարկվում է...' : 'Ուղարկել կոդը'}
                    </Typography>
                  </Pressable>
                </View>
              ) : null}
            </Fragment>
          ))}
          <FormDateField
            control={control}
            name="birthDate"
            label="Ծննդյան ամսաթիվ *"
            rules={BIRTH_DATE_RULES}
            maximumDate={new Date()}
            startIcon={
              <CalendarSvg width={20} height={20} fill={colors.icons} />
            }
          />
          <FormField
            control={control}
            name="phone"
            label="Հեռախոսահամար"
            keyboardType="phone-pad"
            placeholder="+374 91 123 456"
            placeholderTextColor={palette.lightGray}
            startIcon={
              <PhoneSvg width={20} height={20} fill={colors.icons} />
            }
            rules={{
              required: 'Հեռախոսահամարը պարտադիր է',
              pattern: {
                value: PHONE_NUMBER_PATTERN,
                message: 'Մուտքագրեք վավեր հեռախոսահամար',
              },
            }}
          />
        </View>
        {showPhoneVerificationUi ? (
          <Typography variant="h5" style={styles.phoneText}>
            ⓘ Խնդրում ենք հաստատել հեռախոսահամարը
          </Typography>
        ) : null}
      </AnimatedView>
      {showPhoneVerificationUi ? (
        <Pressable
          onPress={handleSendCode}
          disabled={isSubmitting || isSendingCode}
          style={({ pressed }) => [
            styles.primaryButton,
            (pressed || isSubmitting || isSendingCode) && styles.buttonPressed,
          ]}
        >
          <Typography variant="h5" style={styles.primaryButtonText}>
            {isSendingCode ? 'Ուղարկվում է...' : 'Ուղարկել կոդը'}
          </Typography>
        </Pressable>
      ) : null}
      <AuthButton
        disabled={isSaveDisabled}
        title={'Պահպանել'}
        onPress={onSubmit}
        isLoading={isLoading}
        style={{ marginBottom: TAB_BAR_BOTTOM_OFFSET, marginTop: !showPhoneVerificationUi ? 30 : 10 }}
      />
    </FormScrollView>
  );
}
