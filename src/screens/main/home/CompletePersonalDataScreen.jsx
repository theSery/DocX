import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemedStyles, useTheme, useToast } from '../../../hooks';
import {
  AnimatedView,
  CheckBox,
  FormAddressField,
  FormDateField,
  FormField,
  FormScrollView,
  Typography,
} from '../../../components';
import MainHeader from '../../../components/headers/MainHeader';
import AuthButton from '../../../components/buttons/AuthButton';
import UserSvg from '../../../components/icons/UserSvg';
import PhoneSvg from '../../../components/icons/PhoneSvg';
import CalendarSvg from '../../../components/icons/CalendarSvg';
import PasportSvg from '../../../components/icons/PasportSvg';
import PasporFromSvg from '../../../components/icons/PasporFromSvg';
import CodeSvg from '../../../components/icons/CodeSvg';
import AddressSvg from '../../../components/icons/AddressSvg';
import { FONT_FAMILY } from '../../../theme';
import {
  ARMENIAN_ADDRESS_RULES,
  ARMENIAN_NAME_RULES,
  PHONE_NUMBER_PATTERN,
} from '../../../utils/patterns';
import { getIncompletePersonalDataFields } from '../../../utils/personalDataValidation';
import { smsApi } from '../../../api';
import { ConfirmPhoneCodeContent } from './components/ConfirmPhoneCodeContent';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchPersonalData,
  selectPersonalData,
  updatePersonalData,
} from '../../../store/slices/personalDataSlice';

const PROFILE_STORE_FIELDS = ['name', 'surname', 'patronymic', 'birthday', 'phoneNumber'];
const PASSPORT_STORE_FIELDS = [
  'passportSeries',
  'fromWhom',
  'dateOfIssue',
  'publicServiceLicensePlate',
  'registrationAddress',
  'notificationAddress',
];

const FIELD_CONFIGS = colors => ({
  name: {
    label: 'Անուն *',
    startIcon: <UserSvg width={24} height={24} fill={colors.icons} />,
    placeholder: 'Ձեր Անունը',
    rules: ARMENIAN_NAME_RULES,
  },
  surname: {
    label: 'Ազգանուն *',
    startIcon: <UserSvg width={24} height={24} fill={colors.icons} />,
    placeholder: 'Ձեր Ազգանունը',
    rules: ARMENIAN_NAME_RULES,
  },
  patronymic: {
    label: 'Հայրանուն *',
    startIcon: <UserSvg width={24} height={24} fill={colors.icons} />,
    placeholder: 'Ձեր Հայրանուն',
    rules: ARMENIAN_NAME_RULES,
  },
  birthday: {
    type: 'date',
    label: 'Ծննդյան ամսաթիվ *',
    startIcon: <CalendarSvg width={20} height={20} fill={colors.icons} />,
    placeholder: 'ՕՕ / ԱԱ / ՏՏՏՏ',
    rules: {
      required: 'Ծննդյան ամսաթիվը պարտադիր է',
      validate: value => value instanceof Date || 'Ծննդյան ամսաթիվը պարտադիր է',
    },
  },
  phoneNumber: {
    label: 'Հեռախոսահամար',
    startIcon: <PhoneSvg width={20} height={20} fill={colors.icons} />,
    placeholder: '+374 91 123 456',
        name: "phone",
    placeholderTextColor: colors.textDisabled,
    keyboardType: 'phone-pad',
    rules: {
      required: 'Հեռախոսահամարը պարտադիր է',
      pattern: {
        value: PHONE_NUMBER_PATTERN,
        message: 'Մուտքագրեք վավեր հեռախոսահամար',
      },
    },
  },
  passportSeries: {
    label: 'Սերիա *',
    startIcon: <PasportSvg width={19} height={15} fill={colors.icons} />,
    placeholder: 'AM000000',
    rules: {
      required: 'Անձնագրի սերիան պարտադիր է',
    },
  },
  fromWhom: {
    label: 'Ում կողմից է տրված *',
    startIcon: <PasporFromSvg width={18} height={16} fill={colors.icons} />,
    placeholder: '001',
    keyboardType: 'numeric',
    rules: {
      required: 'Տրամադրող մարմինը պարտադիր է',
    },
  },
  dateOfIssue: {
    type: 'date',
    label: 'Երբ է տրվել *',
    startIcon: <CalendarSvg width={24} height={24} fill={colors.icons} />,
    placeholder: 'ՕՕ / ԱԱ / ՏՏՏՏ',
    rules: {
      required: 'Տրման ամսաթիվը պարտադիր է',
      validate: value => value instanceof Date || 'Տրման ամսաթիվը պարտադիր է',
    },
  },
  publicServiceLicensePlate: {
    label: 'ՀԾՀ *',
    startIcon: <CodeSvg width={16} height={13} fill={colors.icons} />,
    placeholder: '0123456789',
    rules: {
      required: 'ՀԾՀ-ն պարտադիր է',
    },
  },
  registrationAddress: {
    type: 'address',
    label: 'Հաշվառման հասցե *',
    startIcon: <AddressSvg width={18} height={18} fill={colors.icons} />,
    placeholder: 'Մարզ, Քաղաք, Հասցե, 0000',
    rules: ARMENIAN_ADDRESS_RULES,
  },
  notificationAddress: {
    type: 'address',
    label: 'Բնակության հասցե *',
    startIcon: <AddressSvg width={18} height={18} fill={colors.icons} />,
    placeholder: 'Մարզ, Քաղաք, Հասցե, 0000',
    rules: ARMENIAN_ADDRESS_RULES,
  },
});

const DATE_FIELDS = ['birthday', 'dateOfIssue'];

function formatPlaceholderDate(value) {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day} / ${month} / ${year}`;
}

function toEmptyFormValue(field) {
  return DATE_FIELDS.includes(field) ? null : '';
}

function toFormInitialValue(field, personalData, missingFields) {
  // Valid registration address is kept as the input value (not a placeholder).
  if (
    field === 'registrationAddress' &&
    !missingFields.includes('registrationAddress')
  ) {
    return personalData?.registrationAddress ?? '';
  }

  return toEmptyFormValue(field);
}

function toPlaceholderValue(field, value, fallbackPlaceholder, { useAsValue = false } = {}) {
  // When the existing value is already in the input, keep the static placeholder.
  if (useAsValue) {
    return fallbackPlaceholder;
  }

  if (DATE_FIELDS.includes(field)) {
    return formatPlaceholderDate(value) || fallbackPlaceholder;
  }

  const trimmed = String(value ?? '').trim();
  return trimmed || fallbackPlaceholder;
}

function toPayloadValue(field, value) {
  if (DATE_FIELDS.includes(field)) {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return value ?? null;
  }

  return value ?? '';
}

function buildPayload(
  missingFields,
  formValues,
  personalData,
  { addressFieldsMissing = false, addressesDiffer = false } = {},
) {
  const includeProfile = missingFields.some(field => PROFILE_STORE_FIELDS.includes(field));
  const includePassport = missingFields.some(field => PASSPORT_STORE_FIELDS.includes(field));

  const groups = [
    ...(includeProfile ? PROFILE_STORE_FIELDS : []),
    ...(includePassport ? PASSPORT_STORE_FIELDS : []),
  ];

  return groups.reduce((payload, field) => {
    const useFormValue =
      missingFields.includes(field) ||
      (addressFieldsMissing && field === 'registrationAddress') ||
      // Only submit notificationAddress from the form when that field is visible.
      (addressFieldsMissing && addressesDiffer && field === 'notificationAddress');

    // Keep existing notificationAddress when its form is hidden.
    if (
      field === 'notificationAddress' &&
      addressFieldsMissing &&
      !addressesDiffer
    ) {
      payload[field] = toPayloadValue(field, personalData?.[field]);
      return payload;
    }

    const rawValue = useFormValue ? formValues[field] : personalData?.[field];

    payload[field] = toPayloadValue(field, rawValue);
    return payload;
  }, {});
}

export function CompletePersonalDataScreen({ navigation, route }) {
  const { templateText, templateName, templateId, templateSolution } = route.params ?? {};
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const personalData = useAppSelector(selectPersonalData);
  const fieldConfigs = useMemo(() => FIELD_CONFIGS(colors), [colors]);

  // Captured once on mount so fields don't disappear while the user is typing.
  const [missingFields] = useState(() => getIncompletePersonalDataFields(personalData));
  const [submitError, setSubmitError] = useState('');
  // Open residence address when it exists or fails validation.
  const [addressesDiffer, setAddressesDiffer] = useState(() => {
    const incomplete = getIncompletePersonalDataFields(personalData);
    return (
      incomplete.includes('notificationAddress') ||
      Boolean(personalData?.notificationAddress?.trim())
    );
  });

  const registrationAddressValid = !missingFields.includes('registrationAddress');
  const notificationAddressMissing = missingFields.includes('notificationAddress');

  // Show the address block when either address is missing or not Armenian.
  const addressFieldsMissing =
    missingFields.includes('registrationAddress') || notificationAddressMissing;

  const missingProfileFields = useMemo(
    () => PROFILE_STORE_FIELDS.filter(field => missingFields.includes(field)),
    [missingFields],
  );
  const missingPassportFields = useMemo(
    () =>
      PASSPORT_STORE_FIELDS.filter(field => {
        if (field === 'notificationAddress') {
          // Residence address is only edited/validated when addresses differ.
          return addressFieldsMissing && addressesDiffer;
        }

        if (field === 'registrationAddress') {
          return addressFieldsMissing;
        }

        return missingFields.includes(field);
      }),
    [missingFields, addressFieldsMissing, addressesDiffer],
  );

  const [isSendingCode, setIsSendingCode] = useState(false);
  // When set, the modal shows the phone code confirmation content instead of the form.
  const [confirmingPhoneNumber, setConfirmingPhoneNumber] = useState(null);
  const [focusedAddressField, setFocusedAddressField] = useState(null);

  // Existing values are shown as placeholders so the user can type immediately,
  // except a valid registrationAddress which is prefilled as the input value.
  const fieldPlaceholders = useMemo(() => {
    const fieldsToInit = new Set(missingFields);
    if (addressFieldsMissing) {
      fieldsToInit.add('registrationAddress');
      fieldsToInit.add('notificationAddress');
    }

    return [...fieldsToInit].reduce((placeholders, field) => {
      const useAsValue =
        field === 'registrationAddress' && registrationAddressValid;

      placeholders[field] = toPlaceholderValue(
        field,
        personalData?.[field],
        fieldConfigs[field]?.placeholder,
        { useAsValue },
      );
      return placeholders;
    }, {});
  }, [
    addressFieldsMissing,
    fieldConfigs,
    missingFields,
    personalData,
    registrationAddressValid,
  ]);

  const {
    control,
    handleSubmit,
    getValues,
    trigger,
    unregister,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: (() => {
      const fieldsToInit = new Set(missingFields);
      // Both address fields can become editable while the address block is shown.
      if (addressFieldsMissing) {
        fieldsToInit.add('registrationAddress');
        fieldsToInit.add('notificationAddress');
      }

      return [...fieldsToInit].reduce((values, field) => {
        values[field] = toFormInitialValue(field, personalData, missingFields);
        return values;
      }, {});
    })(),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const handleSendCode = async () => {
    const isPhoneValid = await trigger('phoneNumber');
    if (!isPhoneValid) {
      return;
    }

    const phoneNumber = getValues('phoneNumber');
    setIsSendingCode(true);
    try {
      await smsApi.requestCode({ phoneNumber });
      showToast({
        title: 'Կոդը ուղարկված է',
        body: 'Հաստատման կոդը ուղարկվել է ձեր հեռախոսահամարին',
        type: 'success',
      });
      setConfirmingPhoneNumber(phoneNumber);
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

  const handleAddressesDifferChange = checked => {
    setAddressesDiffer(checked);
    if (!checked) {
      // Hide residence address and drop its validation for submit.
      unregister('notificationAddress');
    }
  };

  const onSubmit = handleSubmit(async formValues => {
    setSubmitError('');

    try {
      await dispatch(
        updatePersonalData(
          buildPayload(missingFields, formValues, personalData, {
            addressFieldsMissing,
            addressesDiffer,
          }),
        ),
      ).unwrap();

      // Refresh canonical personal data so DocumentCreate and account screens
      // all read the same latest Redux state.
      try {
        await dispatch(fetchPersonalData()).unwrap();
      } catch (refreshError) {
        console.log(refreshError, 'personal data refresh error');
      }

      showToast({
        title: 'Տվյալները հաջողությամբ պահպանվեցին',
        type: 'success',
      });
      navigation.replace('DocumentCreate', {
        templateText,
        templateName,
        templateId,
        templateSolution,
      });
    } catch (error) {
      console.log(error, 'error');
      setSubmitError(
        error?.message || 'Տվյալների պահպանումը ձախողվեց։ Խնդրում ենք փորձել կրկին։',
      );
      showToast({
        title: 'Տվյալների պահպանումը ձախողվեց',
        body: error?.message,
        type: 'error',
      });
    }
  });

  const renderField = field => {
    const config = fieldConfigs[field];
    const placeholder = fieldPlaceholders[field] ?? config.placeholder;

    if (config.type === 'date') {
      return (
        <FormDateField
          key={field}
          control={control}
          name={field}
          label={config.label}
          startIcon={config.startIcon}
          placeholder={placeholder}
          rules={config.rules}
        />
      );
    }

    if (config.type === 'address') {
      // notificationAddress is only registered/validated while addressesDiffer.
      const rules =
        field === 'notificationAddress' && !addressesDiffer ? undefined : config.rules;

      return (
        <View
          key={field}
          style={{
            overflow: 'visible',
            zIndex: focusedAddressField === field ? 9999 : 1,
            elevation: focusedAddressField === field ? 9999 : 1,
          }}
        >
          <FormAddressField
            control={control}
            name={field}
            label={config.label}
            startIcon={config.startIcon}
            placeholder={placeholder}
            rules={rules}
            onFocusChange={(focused) => {
              setFocusedAddressField(focused ? field : null);
            }}
          />
          {field === 'registrationAddress' && addressFieldsMissing && (
            <CheckBox
              style={{ marginTop: 20 }}
              checked={addressesDiffer}
              onChange={handleAddressesDifferChange}
              label="Հաշվառման և բնակության հասցեն տարբերվում են"
            />
          )}
        </View>
      );
    }

    return (
      <FormField
        key={field}
        control={control}
        name={field}
        label={config.label}
        startIcon={config.startIcon}
        placeholder={placeholder}
        placeholderTextColor={config.placeholderTextColor}
        keyboardType={config.keyboardType}
        rules={config.rules}
      />
    );
  };

  const handleHeaderBack = () => {
    if (confirmingPhoneNumber) {
      setConfirmingPhoneNumber(null);
      return;
    }

    navigation.goBack();
  };

  if (confirmingPhoneNumber) {
    return (
      <View style={[styles.screen, { paddingTop: 10, paddingBottom: 10}]}>
        <MainHeader onPress={handleHeaderBack} />
        <ConfirmPhoneCodeContent
          phoneNumber={confirmingPhoneNumber}
          onConfirmed={() => setConfirmingPhoneNumber(null)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: 10, paddingBottom: 10}]}>
      <MainHeader onPress={handleHeaderBack} />
      <FormScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
          <Typography variant="h4" style={styles.screenTitle}>
            Լրացրեք բացակայող տվյալները
          </Typography>
          <Typography variant="h6" tone="secondary" style={styles.screenSubtitle}>
            Փաստաթուղթը կազմելու համար անհրաժեշտ է լրացնել հետևյալ դաշտերը
          </Typography>

          {missingProfileFields.length > 0 && (
            <>
              <Typography variant="h5" style={styles.sectionTitle}>
                Անձնական տվյալներ
              </Typography>
              <View style={styles.formFieldContainer}>
                {missingProfileFields.map(renderField)}
              </View>
              {missingFields.includes('phoneNumber') && (
                <>
                  <Typography variant="h5" style={styles.phoneText}>
                    ⓘ Խնդրում ենք հաստատել հեռախոսահամարը
                  </Typography>
                  <Pressable
                    // onPress={handleSendCode}
                    onPress={() =>
                      setConfirmingPhoneNumber(getValues('phoneNumber'))
                    }
                    disabled={isSubmitting || isSendingCode}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      (pressed || isSubmitting || isSendingCode) &&
                        styles.buttonPressed,
                    ]}
                  >
                    <Typography variant="h5" style={styles.primaryButtonText}>
                      {isSendingCode ? 'Ուղարկվում է...' : 'Ուղարկել կոդը'}
                    </Typography>
                  </Pressable>
                </>
              )}
            </>
          )}

          {missingPassportFields.length > 0 && (
            <>
              <Typography variant="h5" style={styles.sectionTitle}>
                Անձնագրային տվյալներ
              </Typography>
              <View style={styles.formFieldContainer}>
                {missingPassportFields.map(renderField)}
              </View>
            </>
          )}

          <AuthButton
            disabled={isSubmitting}
            isLoading={isSubmitting}
            title="Պահպանել և շարունակել"
            onPress={onSubmit}
            style={styles.submitButton}
          />
          {submitError ? (
            <Typography variant="h6" style={styles.submitErrorText}>
              {submitError}
            </Typography>
          ) : null}
        </AnimatedView>
      </FormScrollView>
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
    },
    scrollView: {
      flex: 1,
      marginTop: 20,
    },
    contentContainer: {
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
    screenSubtitle: {
      marginTop: 8,
      fontSize: 14,
    },
    sectionTitle: {
      marginTop: 24,
      letterSpacing: 0.4,
    },
    formFieldContainer: {
      width: '100%',
      marginTop: 16,
      gap: 20,
      overflow: 'visible',
    },
    submitButton: {
      marginTop: 32,
      width: '100%',
    },
    phoneText: {
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.icons,
      letterSpacing: 1.2,
      marginTop: 8,
      fontSize: 12,
    },
    primaryButton: {
      width: '100%',
      height: 35,
      overflow: 'hidden',
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      borderWidth: 1,
      borderColor: colors.icons,
      marginBottom: 12,
    },
    primaryButtonText: {
      fontFamily: FONT_FAMILY.regular,
      color: colors.icons,
      letterSpacing: 1.2,
    },
    buttonPressed: {
      opacity: 0.88,
    },
    submitErrorText: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.regular,
      color: colors.error,
      marginTop: 8,
      alignSelf: 'center',
      textAlign: 'center',
    },
  });
