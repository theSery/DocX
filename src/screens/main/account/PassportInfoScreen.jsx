import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useGlobalStyles, useThemedStyles, useToast } from '../../../hooks';
import { AnimatedView, CheckBox, FormAddressField, FormDateField, FormField, Typography } from '../../../components';
import { useForm } from 'react-hook-form';
import PasportSvg from '../../../components/icons/PasportSvg';
import { FONT_FAMILY, palette } from '../../../theme';
import CalendarSvg from '../../../components/icons/CalendarSvg';
import AuthButton from '../../../components/buttons/AuthButton';
import CodeSvg from '../../../components/icons/CodeSvg';
import PasporFromSvg from '../../../components/icons/PasporFromSvg';
import AddressSvg from '../../../components/icons/AddressSvg';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  selectPersonalData,
  selectPersonalDataStatus,
  updatePersonalData,
} from '../../../store/slices/personalDataSlice';

const CONTACT_INFO_FIELDS = [
  {
    name: 'passportSeries',
    label: 'Սերիա *',
    startIcon: <PasportSvg width={19} height={15} fill={palette.gray} />,
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
    type: 'address',
    startIcon: <AddressSvg width={18} height={18} fill={palette.gray} />,
    placeholder: 'Մարզ, Քաղաք, Հասցե, 0000',
  },
  {
    name: 'registrationAddress',
    label: 'Բնակության հասցե*',
    type: 'address',
    startIcon: <AddressSvg width={18} height={18} fill={palette.gray} />,
    placeholder: 'Մարզ, Քաղաք, Հասցե, 0000',
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
      overflow: 'visible',
    },
    screenTitle: {
      letterSpacing: 0.9,
    },
    formFieldContainer: {
      width: '100%',
      marginTop: 20,
      gap: 20,
      marginBottom: 40,
      overflow: 'visible',
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
  passportSeries: '',
  fromWhom: '',
  dateOfIssue: null,
  publicServiceLicensePlate: '',
  notificationAddress: '',
  registrationAddress: '',
};

function mapPersonalDataToFormValues(data) {
  return {
    passportSeries: data.passportSeries ?? '',
    fromWhom: data.fromWhom ?? '',
    dateOfIssue: data.dateOfIssue ? new Date(data.dateOfIssue) : null,
    publicServiceLicensePlate: data.publicServiceLicensePlate ?? '',
    notificationAddress: data.notificationAddress ?? '',
    registrationAddress: data.registrationAddress ?? '',
  };
}

function mapFormValuesToPersonalData(values) {
  return {
    passportSeries: values.passportSeries,
    fromWhom: values.fromWhom,
    dateOfIssue: values.dateOfIssue instanceof Date ? values.dateOfIssue.toISOString() : null,
    publicServiceLicensePlate: values.publicServiceLicensePlate,
    notificationAddress: values.notificationAddress,
    registrationAddress: values.registrationAddress,
  };
}

function resolveFormValuesAfterUpdate(submittedValues, apiData) {
  return mapPersonalDataToFormValues({
    ...mapFormValuesToPersonalData(submittedValues),
    ...(apiData ?? {}),
  });
}

export function PassportInfoScreen() {
  const globalStyles = useGlobalStyles();
  const [agreed, setAgreed] = useState(false);
  const styles = useThemedStyles(createStyles);
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const personalData = useAppSelector(selectPersonalData);
  const personalDataStatus = useAppSelector(selectPersonalDataStatus);

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
    if (personalDataStatus === 'succeeded' && personalData) {
      reset(mapPersonalDataToFormValues(personalData));
    }
  }, [personalData, personalDataStatus, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await dispatch(
        updatePersonalData(mapFormValuesToPersonalData(data)),
      ).unwrap();
      const updatedFormValues = resolveFormValuesAfterUpdate(data, response);
      reset(updatedFormValues);
      showToast({
        title: 'Տվյալները հաջողությամբ պահպանվեցին',
        type: 'success',
      });
    } catch (error) {
      console.log('error', error);
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
              <FormDateField
                key={field.name}
                control={control}
                name={field.name}
                label={field.label}
                startIcon={field.startIcon}
                placeholder={field.placeholder}
              />
            ) : field.type === 'address' ? (
              <View key={field.name} style={{ overflow: 'visible', zIndex: field.name === 'registrationAddress' ? 2 : 1 }}>
                <FormAddressField
                  control={control}
                  name={field.name}
                  label={field.label}
                  startIcon={field.startIcon}
                  placeholder={field.placeholder}
                  rules={field.rules}
                  useGoogleAutocomplete
                />
                {field.name === 'notificationAddress' && (
                  <CheckBox
                    style={{ marginTop: 20 }}
                    checked={agreed}
                    onChange={setAgreed}
                    label="Հաշվառման և բնակության հասցեն տարբերվում են"
                  />
                )}
              </View>
            ) : (
              <View key={field.name}>
                <FormField
                  control={control}
                  name={field.name}
                  label={field.label}
                  startIcon={field.startIcon}
                  placeholder={field.placeholder}
                  keyboardType={field.keyboardType}
                  rules={field.rules}
                />
              </View>
            )
          ))}

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
