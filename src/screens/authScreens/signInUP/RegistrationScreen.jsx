import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthScreenLayout } from '../../../components/layout';
import { useAuthScreenStyles, useTheme, useThemedFocusStatusBar, useThemedStyles } from '../../../hooks';
import MainHeader from '../../../components/headers/MainHeader';
import { FormField } from '../../../components';
import { useForm } from 'react-hook-form';
import UserSvg from '../../../components/icons/UserSvg';
import { FONT_FAMILY } from '../../../theme';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import AuthButton from '../../../components/buttons/AuthButton';

export function RegistrationScreen({ navigation, route }) {
  const { email, password } = route.params ?? {};
  const styles = useAuthScreenStyles();
  const localStyles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  useThemedFocusStatusBar();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { name: '', surname: '', patronymic: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(values => {
    navigation.navigate('PinCode', {
      name: values.name,
      surname: values.surname,
      patronymic: values.patronymic,
      email,
      password,
    });
  });

  return (
    <AuthScreenLayout style={[styles.screen]}>
      <MainHeader onPress={() => navigation.goBack()} isHome={true} />
      <ScrollView
        style={localStyles.formArea}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={localStyles.content}
      >
        <View style={localStyles.formContainer}>
          <ContentTiltes
            title={'Անձնական տվյալներ'}
            subtitle={'Գրանցումն ավարտելու համար լրացրեք տվյալները'}
          />
          <FormField
            control={control}
            name="name"
            label="Անուն *"
            startIcon={<UserSvg width={24} height={24} fill={colors.icons} />}
            placeholder="Ձեր Անունը"
          />
          <View style={{ marginVertical: 20 }}>
            <FormField
              control={control}
              name="surname"
              label="Ազգանուն *"
              placeholder="Ձեր Ազգանունը"
              startIcon={<UserSvg width={24} height={24} fill={colors.icons} />}
            />
          </View>
          <FormField
            control={control}
            name="patronymic"
            label="Հայրանուն *"
            placeholder="Ձեր Հայրանունը"
            startIcon={<UserSvg width={24} height={24} fill={colors.icons} />}
          />
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Text style={localStyles.privacyText}>
            Գրանցվելով՝ Դուք համաձայնվում եք{'  '}
            <Text
              style={localStyles.privacyTextBold}
              onPress={() => Linking.openURL('https://www.google.com')}
            >
              Օգտագործման պայմաններին և դրույթներին
            </Text>
            {'  '} և{'  '}
            <Text
              style={localStyles.privacyTextBold}
              onPress={() => Linking.openURL('https://www.google.com')}
            >
              Գաղտնիության քաղաքականությանը
            </Text>
          </Text>
          <AuthButton
            title="Ստեղծել PIN"
            onPress={onSubmit}
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </AuthScreenLayout>
  );
}

const createStyles = colors =>
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
    privacyText: {
      fontSize: 10,
      lineHeight: 18,
      fontFamily: FONT_FAMILY.regular,
      color: colors.textSecondary,
      marginTop: 4,
      marginBottom: 20,
      textAlign: 'center',
    },
    privacyTextBold: {
      fontFamily: FONT_FAMILY.semiBold,
      color: colors.icons,
      textDecorationLine: 'underline',
    },
  });
