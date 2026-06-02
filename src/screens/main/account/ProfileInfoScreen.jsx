import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useMainScreenStyles } from '../../../hooks';
import { AnimatedView, FormDateField, FormField, Typography } from '../../../components';
import { useForm } from 'react-hook-form';
import MailIconSvg from '../../../components/icons/MailIconSvg';
import GradientButton from '../../../components/buttons/GradientButton';
import UserSvg from '../../../components/icons/UserSvg';
import { colors, FONT_FAMILY, palette } from '../../../theme';
import { EMAIL_PATTERN, ARMENIAN_NAME_RULES, PHONE_NUMBER_PATTERN } from '../../../utils/patterns';
import PhoneSvg from '../../../components/icons/PhoneSvg';
import CalendarSvg from '../../../components/icons/CalendarSvg';
const CONTACT_INFO_FIELDS = [
  {
    name: 'email',
    label: 'Էլ.-փոստ *',
    startIcon: <MailIconSvg width={19} height={15} />,
    placeholder: 'example@docx.am',
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
    startIcon: <UserSvg width={24} height={24} fill={colors.gray} />,
    placeholder: 'Ձեր Անունը',
    keyboardType: 'default',
    rules: ARMENIAN_NAME_RULES,
  },
  {
    name: 'lastName',
    label: 'Ազգանուն *',
    startIcon: <UserSvg width={24} height={24} fill={colors.gray} />,
    placeholder: 'Ձեր Ազգանունը',
    keyboardType: 'default',
    rules: ARMENIAN_NAME_RULES,
  },
  {
    name: 'middleName',
    label: 'Միջանուն *',
    startIcon: <UserSvg width={24} height={24} fill={colors.gray} />,
    placeholder: 'Ձեր Միջանունը',
    keyboardType: 'default',
    rules: ARMENIAN_NAME_RULES,
  },

];
export function ProfileInfoScreen() {
  const {
    control,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      name: '',
      lastName: '',
      middleName: '',
      phone: '',
      birthDate: null,
    },
    mode: 'onBlur',
  });
  const onSubmit = (data) => {
    console.log(data);
  };
  return (
    <ScrollView style={styles.screen}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={{ paddingBottom: 32, width: '100%' }}>
      <AnimatedView animation="fadeIn" duration={500} style={[styles.content]}>
        <Typography variant="h4" style={styles.addBalanceText}>
          Անձնական տվյալներ
        </Typography>
        <View style={styles.formFieldContainer}>
          {CONTACT_INFO_FIELDS.map((field) => (
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
          ))}
          <FormDateField
            control={control}
            name="birthDate"
            label="Ծննդյան ամսաթիվ"
            startIcon={<CalendarSvg width={20} height={20} fill={colors.mainBlue} />}
          />
          <FormField
            control={control}
            name="phone"
            label="Հեռախոսահամար"
            keyboardType="phone-pad"
            placeholder="91 123 456"
            placeholderTextColor={colors.lightGray}
            startIcon={<PhoneSvg width={20} height={20} fill={colors.mainBlue} />}
            rules={{
              required: 'Հեռախոսահամարը պարտադիր է',
              pattern: {
                value: PHONE_NUMBER_PATTERN,
                message: 'Մուտքագրեք վավեր հեռախոսահամար',
              },
            }}
          />

        </View>

      </AnimatedView>
      <Pressable
        onPress={handleSubmit(onSubmit)}
        // disabled={isSubmitting}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <GradientButton height={45} isLight={false}>
          <Typography variant="h5" style={styles.primaryButtonText}>
            Պահպանել
          </Typography>
        </GradientButton>
      </Pressable>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,

  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 20,
  },
  addBalanceText: {
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
    marginTop: 8,
  },
  primaryButtonText: {
    fontFamily: FONT_FAMILY.regular,
    color: palette.white,
    letterSpacing: 1.2,
  },
});