import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { personalDataApi } from '../../../api';
import { useGlobalStyles, useThemedStyles, useToast } from '../../../hooks';
import { AnimatedView, FormDateField, FormField, Typography } from '../../../components';
import { useForm } from 'react-hook-form';
import PasportSvg from '../../../components/icons/PasportSvg';
import UserSvg from '../../../components/icons/UserSvg';
import { FONT_FAMILY, palette } from '../../../theme';
import { EMAIL_PATTERN, ARMENIAN_NAME_RULES, PHONE_NUMBER_PATTERN } from '../../../utils/patterns';
import PhoneSvg from '../../../components/icons/PhoneSvg';
import CalendarSvg from '../../../components/icons/CalendarSvg';
import AuthButton from '../../../components/buttons/AuthButton';
import CodeSvg from '../../../components/icons/CodeSvg';
import PasporFromSvg from '../../../components/icons/PasporFromSvg';
import AddressSvg from '../../../components/icons/AddressSvg';

const CONTACT_INFO_FIELDS = [
  {
    name: 'passportSeries',
    label: 'Սերիա *',
    startIcon: <PasportSvg width={19} height={15} fill={palette.gray}/>,
    placeholder: 'AM000000',
    // keyboardType: 'email-address',
    // rules: {
    //   required: 'Էլ.-փոստը պարտադիր է',
    //   pattern: {
    //     value: EMAIL_PATTERN,
    //     message: 'Մուտքագրեք վավեր էլ.-փոստ',
    //   },
    // },
  },
  {
    name: 'fromWhom',
    label: 'Ում կողմից է տրված *',
    startIcon: <PasporFromSvg width={18} height={16} fill={palette.gray} />,
    placeholder: '001',
    // keyboardType: 'default',
    // rules: ARMENIAN_NAME_RULES,
  },
  {
    name: 'dateOfIssue',
    label: 'Երբ է տրվել *',
    startIcon: <CalendarSvg width={24} height={24} fill={palette.gray} />,
    placeholder: 'ՕՕ / ԱԱ / ՏՏՏՏ',
    // keyboardType: 'default',
    // rules: ARMENIAN_NAME_RULES,
  },
  {
    name: 'publicServiceLicensePlate',
    label: 'ՀԾՀ *',
    startIcon: <CodeSvg width={16} height={13} fill={palette.gray} />,
    placeholder: '0123456789',
    // keyboardType: 'default',
    // rules: ARMENIAN_NAME_RULES,
  },
  {
    name: 'notificationAddress',
    label: 'Հաշվառման հասցե ',
    startIcon: <AddressSvg width={18} height={18} fill={palette.gray} />,
    placeholder: 'Մարզ, Քաղաք, Հասցե, 0000',
    // keyboardType: 'default',
    // rules: ARMENIAN_NAME_RULES,
  },
  {
    name: 'registrationAddress',
    label: 'Բնակության հասցե*',
    startIcon: <AddressSvg width={18} height={18} fill={palette.gray} />,
    placeholder: 'Մարզ, Քաղաք, Հասցե, 0000',
    // keyboardType: 'default',
    // rules: ARMENIAN_NAME_RULES,
  },
];

const createStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 16,
      marginBottom: 72,
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
      marginBottom: 40,
    },
    primaryButton: {
      height: 45,
      overflow: 'hidden',
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    primaryButtonText: {
      fontFamily: FONT_FAMILY.regular,
      color: palette.white,
      letterSpacing: 1.2,
    },
    buttonPressed: {
      opacity: 0.88,
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
    birthday: values.birthDate instanceof Date ? values.birthDate.toISOString() : null,
  };
}

function resolveFormValuesAfterUpdate(submittedValues, apiData) {
  return mapPersonalDataToFormValues({
    email: submittedValues.email,
    ...mapFormValuesToPersonalData(submittedValues),
    ...(apiData ?? {}),
  });
}

export function PassportInfoScreen() {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isLoading },
  } = useForm({
    defaultValues: EMPTY_FORM_VALUES,
    mode: 'onBlur',
  });

  useEffect(() => {
    const controller = new AbortController();

    personalDataApi
      .getPersonalData({ signal: controller.signal })
      .then((response) => {
        reset(mapPersonalDataToFormValues(response.data));
      })
      .catch((error) => {
        if (error.type !== 'cancel') {
          console.log('personal-data error:', error);
        }
      });

    return () => controller.abort();
  }, [reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await personalDataApi.updatePersonalData(
        mapFormValuesToPersonalData(data),
      );
      const updatedFormValues = resolveFormValuesAfterUpdate(data, response.data);
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
    <ScrollView
      style={[globalStyles.screen, styles.screen]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={styles.contentContainer}
    >
      <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
        <Typography variant="h4" style={styles.screenTitle}>
        Անձը հաստատող փաստաթուղթ` Անձնագիր. Նույն. քարտ
        </Typography>
        <View style={styles.formFieldContainer}>
          {CONTACT_INFO_FIELDS.map((field) => (
            field.name === 'dateOfIssue' ? (
              <View  key={field.name}>
                            <FormDateField
               
                control={control}
                name={field.name}
                label={field.label}
                startIcon={field.startIcon}
                placeholder={field.placeholder}
              />
              </View>

            ) : (
              <FormField
                key={field.name}
                control={control}
                name={field.name}
                label={field.label}
                startIcon={field.startIcon}
                placeholder={field.placeholder}
                keyboardType={field.keyboardType}
                rules={field.rules}
              />
            )
          ))}
          {/* <FormDateField
            control={control}
            name="birthDate"
            label="Ծննդյան ամսաթիվ"
            startIcon={<CalendarSvg width={20} height={20} fill={palette.mainBlue} />}
          /> */}
          {/* <FormField
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
                value: PHONE_NUMBER_PATTERN,
                message: 'Մուտքագրեք վավեր հեռախոսահամար',
              },
            }}
          /> */}
        </View>
      </AnimatedView>
                  <AuthButton
                  disabled={isSubmitting}
              title={'Պահպանել'}
              onPress={onSubmit}
              isLoading={isLoading}
            />
    </ScrollView>
  );
}
