import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthScreenLayout } from '../../../components/layout';
import { useAuthScreenStyles } from '../../../hooks';
import MainHeader from '../../../components/headers/MainHeader';
import { FormField, Typography } from '../../../components';
import { useForm } from 'react-hook-form';
import GradientButton from '../../../components/buttons/GradientButton';
import UserSvg from '../../../components/icons/UserSvg';
import { FONT_FAMILY, palette } from '../../../theme';

export function RegistrationScreen({ navigation }) {
  const styles = useAuthScreenStyles();
  const {
    control,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { name: '', lastName: '', middleName: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(values => {
    navigation.navigate('EmailVerification', {
      name: values.name,
      lastName: values.lastName,
      middleName: values.middleName,
    });
  });
  return (
    <AuthScreenLayout style={[styles.screen, {backgroundColor: palette.mainWhite}]}>
      <MainHeader onPress={() => navigation.goBack()} />
        <View style={registrationScreenStyles.content}>
        <View style={registrationScreenStyles.formContainer}>
        <Typography variant="h2" style={registrationScreenStyles.loginTitle}>
        Անձնական տվյալներ
        </Typography>
        <Typography variant="h6" style={registrationScreenStyles.subTitle}>
        Գրանցումն ավարտելու համար լրացրեք տվյալները
        </Typography>
        <FormField
          control={control}
          name="name"
          label="Անուն *"
          startIcon={     <UserSvg width={24} height={24} fill={palette.gray} />}
          placeholder="Ձեր Անունը"
        />
        <View style={{ marginVertical: 20 }}>
          <FormField
            control={control}
            name="lastName"
            label="Ազգանուն *"
            placeholder="Ձեր Ազգանունը"
            startIcon={     <UserSvg width={24} height={24} fill={palette.gray} />}
          />
        </View>
        <FormField
          control={control}
          name="middleName"
          label="Հայրանուն *"
          placeholder="Ձեր Հայրանունը"
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
        <Pressable
          onPress={onSubmit}
          disabled={isSubmitting}
          style={({ pressed }) => [
            registrationScreenStyles.primaryButton,
            pressed &&  registrationScreenStyles.buttonPressed,
          ]}
        >
          <GradientButton height={45} isLight={false}>
            <Typography variant="h5" style={registrationScreenStyles.primaryButtonText}>
            Գրանցվել
            </Typography>
          </GradientButton>
        </Pressable>
      </View>
        </View>
      {/* <View style={styles.content}>
        <Text style={styles.title}>Registration</Text>
        <Text style={styles.subtitle}>Create your DocX account.</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Verification')}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </View> */}
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
  loginTitle: {
    letterSpacing: 2,
        marginTop: 20,
      },
      subTitle: {
        color: palette.gray,
        marginBottom: 30,
        letterSpacing: .4,
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