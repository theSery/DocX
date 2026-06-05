import { Linking, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { AuthScreenLayout } from '../../../components/layout';
import { useAuthScreenStyles } from '../../../hooks';
import MainHeader from '../../../components/headers/MainHeader';
import {FormField, Typography } from '../../../components';
import { useForm } from 'react-hook-form';
import GradientButton from '../../../components/buttons/GradientButton';
import UserSvg from '../../../components/icons/UserSvg';
import { FONT_FAMILY, palette } from '../../../theme';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { ARMENIAN_NAME_RULES } from '../../../utils/patterns';
import AuthButton from '../../../components/buttons/AuthButton';

export function RegistrationScreen({ navigation, route }) {
  const { email, password } = route.params ?? {};
  const styles = useAuthScreenStyles();
  const {
    control,
    getValues,
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
    <AuthScreenLayout style={[styles.screen, {backgroundColor: palette.mainWhite}]}>
      <StatusBar barStyle="dark-content" />
      <MainHeader  />
        <View style={registrationScreenStyles.content}>
        <View style={registrationScreenStyles.formContainer}>
        <ContentTiltes title={'Անձնական տվյալներ'} subtitle={'Գրանցումն ավարտելու համար լրացրեք տվյալները'} />
        <FormField
          control={control}
          name="name"
          label="Անուն *"
          rules={ARMENIAN_NAME_RULES}
          startIcon={     <UserSvg width={24} height={24} fill={palette.gray} />}
          placeholder="Ձեր Անունը"
        />
        <View style={{ marginVertical: 20 }}>
          <FormField
            control={control}
            name="surname"
            label="Ազգանուն *"
            placeholder="Ձեր Ազգանունը"
            rules={ARMENIAN_NAME_RULES}
            startIcon={     <UserSvg width={24} height={24} fill={palette.gray} />}
          />
        </View>
        <FormField
          control={control}
          name="patronymic"
          label="Հայրանուն *"
          placeholder="Ձեր Հայրանունը"
                rules={ARMENIAN_NAME_RULES}
          startIcon={     <UserSvg width={24} height={24} fill={palette.gray} />}
        />
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Text style={registrationScreenStyles.privacyText}>
          Գրանցվելով՝ Դուք համաձայնվում եք{'  '}
          <Text style={registrationScreenStyles.privacyTextBold} onPress={() => Linking.openURL('https://www.google.com')}>
            Օգտագործման պայմաններին և դրույթներին
          </Text>
          {'  '} և{'  '}
          <Text style={registrationScreenStyles.privacyTextBold} Press={() => Linking.openURL('https://www.google.com')}>
            Գաղտնիության քաղաքականությանը
          </Text>
        </Text>
        {/* <Pressable
          onPress={onSubmit}
          disabled={isSubmitting}
          style={({ pressed }) => [
            registrationScreenStyles.primaryButton,
            pressed &&  registrationScreenStyles.buttonPressed,
          ]}
        >
          <GradientButton height={45} isLight={false}>
            <Typography variant="h5" style={registrationScreenStyles.primaryButtonText}>
            Ստեղծել PIN
            </Typography>
          </GradientButton>
        </Pressable> */}
                    <AuthButton
              title="Ստեղծել PIN"
              onPress={onSubmit}
              isLoading={isSubmitting}
            />
      </View>
        </View>
    </AuthScreenLayout>
  );
}
const registrationScreenStyles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'red',
    width: '100%',
    marginBottom: 20,
  },
  container: {
    flex: 1,
    height: '100%',
  },

  formContainer:{
    width: '100%',
    // backgroundColor: 'blue',
  },
  privacyText: {
    fontSize: 10,
    lineHeight: 18,
    fontFamily: FONT_FAMILY.regular,
    color: palette.gray,
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryButton: {
    height: 45,
    overflow: 'hidden',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontFamily: FONT_FAMILY.regular,
    color: palette.white,
    letterSpacing: 1.2,
  },
  privacyTextBold: {
    fontFamily: FONT_FAMILY.semiBold,
    color: palette.mainBlue,
    textDecorationLine: 'underline',
    // marginHorizontal: 4,
  },
});