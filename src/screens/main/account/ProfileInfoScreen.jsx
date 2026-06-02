import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useGlobalStyles, useThemedStyles } from '../../../hooks';
import { AnimatedView, FormDateField, FormField, Typography } from '../../../components';
import { useForm } from 'react-hook-form';
import MailIconSvg from '../../../components/icons/MailIconSvg';
import GradientButton from '../../../components/buttons/GradientButton';
import UserSvg from '../../../components/icons/UserSvg';
import { FONT_FAMILY, palette } from '../../../theme';
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
    startIcon: <UserSvg width={24} height={24} fill={palette.gray} />,
    placeholder: 'Ձեր Անունը',
    keyboardType: 'default',
    rules: ARMENIAN_NAME_RULES,
  },
  {
    name: 'lastName',
    label: 'Ազգանուն *',
    startIcon: <UserSvg width={24} height={24} fill={palette.gray} />,
    placeholder: 'Ձեր Ազգանունը',
    keyboardType: 'default',
    rules: ARMENIAN_NAME_RULES,
  },
  {
    name: 'middleName',
    label: 'Միջանուն *',
    startIcon: <UserSvg width={24} height={24} fill={palette.gray} />,
    placeholder: 'Ձեր Միջանունը',
    keyboardType: 'default',
    rules: ARMENIAN_NAME_RULES,
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

export function ProfileInfoScreen() {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);

  const {
    control,
    handleSubmit,
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
            startIcon={<CalendarSvg width={20} height={20} fill={palette.mainBlue} />}
          />
          <FormField
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
          />
        </View>
      </AnimatedView>
      <Pressable
        onPress={handleSubmit(onSubmit)}
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
