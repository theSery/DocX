import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGlobalStyles, useThemedStyles, useTheme, useToast } from '../../../hooks';
import {
  AnimatedView,
  FormDateField,
  FormField,
  FormScrollView,
  Typography,
} from '../../../components';
import { useForm } from 'react-hook-form';
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
  selectPersonalData,
  selectPersonalDataStatus,
  updatePersonalData,
} from '../../../store/slices/personalDataSlice';
import { smsApi } from '../../../api';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';

const BIRTH_DATE_RULES = {
  required: 'Ծննդյան ամսաթիվը պարտադիր է',
  validate: value =>
    value instanceof Date || 'Ծննդյան ամսաթիվը պարտադիր է',
};

const CONTACT_INFO_FIELDS = [
  {
    name: 'email',
    label: 'Էլ.-փոստ *',
    Icon: MailIconSvg,
    placeholder: 'example@docx.am',
    keyboardType: 'email-address',
    editable: false,
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
  const navigation = useNavigation();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const personalData = useAppSelector(selectPersonalData);
  const personalDataStatus = useAppSelector(selectPersonalDataStatus);
  const [isSendingCode, setIsSendingCode] = useState(false);

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

  useEffect(() => {
    if (personalDataStatus !== 'succeeded' || !personalData) {
      return;
    }

    reset(mapPersonalDataToFormValues(personalData));
  }, [personalData, personalDataStatus, reset]);

  const handleSendCode = async () => {
    const isPhoneValid = await trigger('phone');
    if (!isPhoneValid) {
      return;
    }

    const phoneNumber = getValues('phone');
    setIsSendingCode(true);
    try {
      await smsApi.requestCode({ phoneNumber });
      showToast({
        title: 'Կոդը ուղարկված է',
        body: 'Հաստատման կոդը ուղարկվել է ձեր հեռախոսահամարին',
        type: 'success',
      });
      navigation.navigate('ConfirmPhoneCode', { phoneNumber });
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
            <FormField
              key={field.name}
              control={control}
              name={field.name}
              label={field.label}
              startIcon={<field.Icon fill={colors.icons} width={20} height={20} />}
              placeholder={field.placeholder}
              keyboardType={field.keyboardType}
              editable={field.editable}
              rules={field.rules}
            />
          ))}
          <FormDateField
            control={control}
            name="birthDate"
            label="Ծննդյան ամսաթիվ *"
            rules={BIRTH_DATE_RULES}
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
        <Typography variant="h5" style={styles.phoneText}>
          ⓘ Խնդրում ենք հաստատել հեռախոսահամարը
        </Typography>
      </AnimatedView>
      <Pressable
        // onPress={handleSendCode}
        onPress={() => navigation.navigate('ConfirmPhoneCode', { phoneNumber: getValues('phone') })}
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
      <AuthButton
        disabled={isSubmitting}
        title={'Պահպանել'}
        onPress={onSubmit}
        isLoading={isLoading}
        style={{ marginBottom: TAB_BAR_BOTTOM_OFFSET }}
      />
    </FormScrollView>
  );
}
