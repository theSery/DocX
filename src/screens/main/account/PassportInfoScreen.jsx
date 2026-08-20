import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGlobalStyles, useThemedStyles, useTheme, useToast } from '../../../hooks';
import {
  AnimatedView,
  CheckBox,
  FormAddressField,
  FormDateField,
  FormField,
  FormScrollView,
  Typography,
} from '../../../components';
import { useForm } from 'react-hook-form';
import PasportSvg from '../../../components/icons/PasportSvg';
import { FONT_FAMILY, palette } from '../../../theme';
import { ARMENIAN_ADDRESS_RULES } from '../../../utils/patterns';
import CalendarSvg from '../../../components/icons/CalendarSvg';
import AuthButton from '../../../components/buttons/AuthButton';
import CodeSvg from '../../../components/icons/CodeSvg';
import PasporFromSvg from '../../../components/icons/PasporFromSvg';
import AddressSvg from '../../../components/icons/AddressSvg';
import { userApi } from '../../../api';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchPersonalData,
  selectPersonalData,
  selectPersonalDataStatus,
  setUserFlags,
  updatePersonalData,
} from '../../../store/slices/personalDataSlice';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';

const DATE_OF_ISSUE_RULES = {
  required: 'Տրման ամսաթիվը պարտադիր է',
  validate: value => {
    if (!(value instanceof Date)) {
      return 'Տրման ամսաթիվը պարտադիր է';
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return value <= today || 'Տրման ամսաթիվը չի կարող լինել ապագայում';
  },
};

const CONTACT_INFO_FIELDS = [
  {
    name: 'passportSeries',
    label: 'Սերիա *',
    Icon: PasportSvg,
    placeholder: 'AM000000',
    rules: {
      required: 'Անձնագրի սերիան պարտադիր է',
    },
  },
  {
    name: 'fromWhom',
    label: 'Ում կողմից է տրված *',
    Icon: PasporFromSvg,
    placeholder: '001',
    keyboardType: 'numeric',
    rules: {
      required: 'Տրամադրող մարմինը պարտադիր է',
    },
  },
  {
    name: 'dateOfIssue',
    label: 'Երբ է տրվել *',
    Icon: CalendarSvg,
    placeholder: 'ՕՕ / ԱԱ / ՏՏՏՏ',
    rules: DATE_OF_ISSUE_RULES,
  },
  {
    name: 'publicServiceLicensePlate',
    label: 'ՀԾՀ *',
    Icon: CodeSvg,
    placeholder: '0123456789',
    rules: {
      required: 'ՀԾՀ-ն պարտադիր է',
    },
  },
  {
    name: 'registrationAddress',
    label: 'Հաշվառման հասցե *',
    type: 'address',
    Icon: AddressSvg,
    placeholder: 'Մարզ, Քաղաք, Հասցե, 0000',
    rules: ARMENIAN_ADDRESS_RULES,
  },
  {
    name: 'notificationAddress',
    label: 'Բնակության հասցե*',
    type: 'address',
    Icon: AddressSvg,
    placeholder: 'Մարզ, Քաղաք, Հասցե, 0000',
    rules: ARMENIAN_ADDRESS_RULES,
  },
];

const createStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 16,
      // marginBottom: TAB_BAR_BOTTOM_OFFSET,
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
    addressBlock: {
      width: '100%',
      overflow: 'visible',
      zIndex: 1,
    },
    addressBlockFocused: {
      zIndex: 9999,
      elevation: 9999,
    },
    addressCheckbox: {
      marginTop: 20,
    },
    secondaryAddressField: {
      marginTop: 20,
      overflow: 'visible',
      zIndex: 1,
    },
    secondaryAddressFieldFocused: {
      zIndex: 9999,
      elevation: 9999,
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

function mapFormValuesToPersonalData(values, { includeNotificationAddress = true } = {}) {
  return {
    passportSeries: values.passportSeries,
    fromWhom: values.fromWhom,
    dateOfIssue: values.dateOfIssue instanceof Date ? values.dateOfIssue.toISOString() : null,
    publicServiceLicensePlate: values.publicServiceLicensePlate,
    registrationAddress: values.registrationAddress,
    notificationAddress: includeNotificationAddress
      ? (values.notificationAddress ?? null)
      : null,
  };
}

function resolveFormValuesAfterUpdate(submittedValues, apiData) {
  return mapPersonalDataToFormValues({
    ...mapFormValuesToPersonalData(submittedValues),
    ...(apiData ?? {}),
  });
}

const NOTIFICATION_ADDRESS_FIELD = CONTACT_INFO_FIELDS.find(
  (field) => field.name === 'notificationAddress',
);

export function PassportInfoScreen() {
  const navigation = useNavigation();
  const globalStyles = useGlobalStyles();
  const [agreed, setAgreed] = useState(false);
  const [focusedAddressField, setFocusedAddressField] = useState(null);
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const personalData = useAppSelector(selectPersonalData);
  const personalDataStatus = useAppSelector(selectPersonalDataStatus);

  const {
    control,
    handleSubmit,
    reset,
    unregister,
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

    const formValues = mapPersonalDataToFormValues(personalData);
    reset(formValues);

    const registration = formValues.registrationAddress?.trim() ?? '';
    const notification = formValues.notificationAddress?.trim() ?? '';
    setAgreed(Boolean(registration && notification && registration !== notification));
  }, [personalData, personalDataStatus, reset]);

  const handleAgreedChange = (checked) => {
    setAgreed(checked);
    if (!checked) {
      unregister('notificationAddress');
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = mapFormValuesToPersonalData(data, {
        includeNotificationAddress: agreed,
      });
      const response = await dispatch(updatePersonalData(payload)).unwrap();
      dispatch(
        setUserFlags({
          hasNotificationAddress: Boolean(payload.notificationAddress?.trim()),
        }),
      );

      try {
        await dispatch(fetchPersonalData()).unwrap();
      } catch (refreshError) {
        console.log(refreshError, 'personal data refresh error');
      }

      try {
        const { data: me } = await userApi.getMe();
        dispatch(
          setUserFlags({
            hasSignature: Boolean(me?.hasSignature),
            isPhoneVerified: Boolean(me?.isPhoneVerified),
            isEmailVerified: Boolean(me?.isEmailVerified),
            hasNotificationAddress: Boolean(me?.hasNotificationAddress),
          }),
        );
      } catch {
        // Local hasNotificationAddress already reflects the saved payload.
      }

      const updatedFormValues = resolveFormValuesAfterUpdate(
        {
          ...data,
          notificationAddress: agreed ? payload.notificationAddress : null,
        },
        response,
      );
      reset(updatedFormValues);
      navigation.navigate('AccountMain');
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
    <FormScrollView
      style={[globalStyles.screen, styles.screen]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
        <Typography variant="h4" style={styles.screenTitle}>
          Անձը հաստատող փաստաթուղթ` Անձնագիր / Նույն. քարտ
        </Typography>
        <View style={styles.formFieldContainer}>
          {CONTACT_INFO_FIELDS.map((field) => {
            // Rendered below the checkbox when addresses differ.
            if (field.name === 'notificationAddress') {
              return null;
            }

            const startIcon = (
              <field.Icon fill={colors.icons} width={20} height={20} />
            );

            if (field.name === 'dateOfIssue') {
              return (
                <FormDateField
                  key={field.name}
                  control={control}
                  name={field.name}
                  label={field.label}
                  startIcon={startIcon}
                  placeholder={field.placeholder}
                  rules={field.rules}
                  maximumDate={new Date()}
                />
              );
            }

            if (field.type === 'address') {
              return (
                <View
                  key={field.name}
                  style={[
                    styles.addressBlock,
                    (focusedAddressField === field.name ||
                      focusedAddressField === NOTIFICATION_ADDRESS_FIELD.name) &&
                      styles.addressBlockFocused,
                  ]}
                >
                  <FormAddressField
                    control={control}
                    name={field.name}
                    label={field.label}
                    startIcon={startIcon}
                    placeholder={field.placeholder}
                    rules={field.rules}
                    onFocusChange={(focused) => {
                      setFocusedAddressField(focused ? field.name : null);
                    }}
                  />
                  <CheckBox
                    style={styles.addressCheckbox}
                    checked={agreed}
                    onChange={handleAgreedChange}
                    label="Հաշվառման և բնակության հասցեն տարբերվում են"
                  />
                  {agreed ? (
                    <View
                      style={[
                        styles.secondaryAddressField,
                        focusedAddressField === NOTIFICATION_ADDRESS_FIELD.name &&
                          styles.secondaryAddressFieldFocused,
                      ]}
                    >
                      <FormAddressField
                        control={control}
                        name={NOTIFICATION_ADDRESS_FIELD.name}
                        label={NOTIFICATION_ADDRESS_FIELD.label}
                        startIcon={
                          <NOTIFICATION_ADDRESS_FIELD.Icon
                            fill={colors.icons}
                            width={20}
                            height={20}
                          />
                        }
                        placeholder={NOTIFICATION_ADDRESS_FIELD.placeholder}
                        rules={NOTIFICATION_ADDRESS_FIELD.rules}
                        onFocusChange={(focused) => {
                          setFocusedAddressField(
                            focused ? NOTIFICATION_ADDRESS_FIELD.name : null,
                          );
                        }}
                      />
                    </View>
                  ) : null}
                </View>
              );
            }

            return (
              <View key={field.name}>
                <FormField
                  control={control}
                  name={field.name}
                  label={field.label}
                  startIcon={startIcon}
                  placeholder={field.placeholder}
                  keyboardType={field.keyboardType}
                  rules={field.rules}
                />
              </View>
            );
          })}
        </View>
      </AnimatedView>
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
