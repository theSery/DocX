import { StyleSheet, View } from 'react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { AuthScreenLayout } from '../../../components/layout';
import { useAuthScreenStyles, useTheme, useThemedFocusStatusBar, useThemedStyles } from '../../../hooks';
import MainHeader from '../../../components/headers/MainHeader';
import { Dropdown, DropdownHost, FormField, FormScrollView } from '../../../components';
import UserSvg from '../../../components/icons/UserSvg';
import CitizenshipSvg from '../../../components/icons/CitizenshipSvg';
import { countries } from '../../../data/countries';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import AuthButton from '../../../components/buttons/AuthButton';
import { RegistrationPrivacyText } from './components/RegistrationPrivacyText';

const MIN_NAME_LENGTH = 3;

function hasMinLetterLength(value, message) {
  const letterCount = String(value ?? '').replace(/\s/g, '').length;
  return letterCount >= MIN_NAME_LENGTH || message;
}

const NAME_MIN_LENGTH_RULES = {
  required: 'Անունը պարտադիր է',
  validate: value =>
    hasMinLetterLength(value, 'Անունը պետք է լինի առնվազն 3 տառ'),
};

const SURNAME_MIN_LENGTH_RULES = {
  required: 'Ազգանունը պարտադիր է',
  validate: value =>
    hasMinLetterLength(value, 'Ազգանունը պետք է լինի առնվազն 3 տառ'),
};
import {
  findCountryByCitizenship,
  toCitizenshipValue,
} from '../../../utils/personalDataValidation';

export function RegistrationScreen({ navigation, route }) {
  const { email, phoneNumber, password } = route.params ?? {};
  const styles = useAuthScreenStyles();
  const localStyles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  useThemedFocusStatusBar();
  const {
    control,
    handleSubmit,
    trigger,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { name: '', surname: '', citizenship: '' },
    mode: 'onBlur',
  });
  const watchedCitizenship = useWatch({ control, name: 'citizenship' }) ?? '';
  const hasSelectedCitizenship = Boolean(findCountryByCitizenship(watchedCitizenship));

  const onSubmit = handleSubmit(values => {
    if (!findCountryByCitizenship(values.citizenship)) {
      trigger('citizenship');
      return;
    }

    navigation.navigate('PinCode', {
      name: values.name,
      surname: values.surname,
      patronymic: null,
      citizenship: values.citizenship,
      email,
      phoneNumber,
      password,
    });
  });

  return (
    <AuthScreenLayout style={[styles.screen]}>
      <MainHeader onPress={() => navigation.goBack()} isHome={true} />
      <FormScrollView
        style={localStyles.formArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.content}
      >
        <DropdownHost style={localStyles.formContainer}>
          <View style={localStyles.formContainer}>
            <ContentTiltes
              title={'Անձնական տվյալներ'}
              subtitle={'Գրանցումն ավարտելու համար լրացրեք տվյալները'}
            />
            <Controller
              control={control}
              name="citizenship"
              rules={{ required: 'Քաղաքացիությունը պարտադիր է' }}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <Dropdown
                  items={countries}
                  value={findCountryByCitizenship(value)?.id ?? null}
                  onChange={country => onChange(toCitizenshipValue(country))}
                  label="Քաղաքացիություն *"
                  placeholder="Քաղաքացիություն"
                  startIcon={
                    <CitizenshipSvg width={20} height={20} fill={colors.icons} />
                  }
                  getItemLabel={country => country.nameHy}
                  getItemSecondaryLabel={country => country.nameEn}
                  getItemFlag={country => country.flagSvg}
                  error={error?.message}
                />
              )}
            />
            <View style={{ marginTop: 20 }}>
              <FormField
                control={control}
                name="name"
                label="Անուն *"
                startIcon={<UserSvg width={24} height={24} fill={colors.icons} />}
                placeholder="Ձեր Անունը"
                rules={NAME_MIN_LENGTH_RULES}
              />
            </View>
            <View style={{ marginVertical: 20 }}>
              <FormField
                control={control}
                name="surname"
                label="Ազգանուն *"
                placeholder="Ձեր Ազգանունը"
                startIcon={<UserSvg width={24} height={24} fill={colors.icons} />}
                rules={SURNAME_MIN_LENGTH_RULES}
              />
            </View>
          </View>
        </DropdownHost>

        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <RegistrationPrivacyText />
          <AuthButton
            disabled={!hasSelectedCitizenship}
            title="Ստեղծել PIN"
            onPress={onSubmit}
            isLoading={isSubmitting}
          />
        </View>
      </FormScrollView>
    </AuthScreenLayout>
  );
}

const createStyles = () =>
  StyleSheet.create({
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      marginBottom: 20,
    },
    formContainer: {
      width: '100%',
    },
    formArea: {
      flex: 1,
      width: '100%',
    },
  });
