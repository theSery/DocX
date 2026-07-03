import { ScrollView, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { AnimatedView, FormField } from '../../../components';
import AuthButton from '../../../components/buttons/AuthButton';
import LockIconSbg from '../../../components/icons/LockIconSbg';
import { useGlobalStyles, useThemedStyles, useToast } from '../../../hooks';

const createStyles = () =>
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
    formFieldContainer: {
      width: '100%',
      marginTop: 20,
      gap: 20,
    },
  });

export function ChangePasswordScreen() {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { showToast } = useToast();

  const {
    control,
    getValues,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(async () => {
    try {
      reset();
      showToast({
        title: 'Գաղտնաբառը հաջողությամբ փոխվեց',
        type: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Գաղտնաբառի փոփոխումը ձախողվեց',
        body: error?.message,
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
        <View style={styles.formFieldContainer}>
          <FormField
            control={control}
            name="currentPassword"
            label="Գաղտնաբառ *"
            placeholder="********"
            startIcon={<LockIconSbg width={17} height={19} />}
            secureTextEntry
            rules={{
              required: 'Գաղտնաբառը պարտադիր է',
            }}
          />
          <FormField
            control={control}
            name="newPassword"
            label="Նոր գաղտնաբառ *"
            placeholder="********"
            startIcon={<LockIconSbg width={17} height={19} />}
            secureTextEntry
            rules={{
              required: 'Նոր գաղտնաբառը պարտադիր է',
              minLength: { value: 6, message: 'Առնվազն 6 նիշ' },
            }}
          />
          <FormField
            control={control}
            name="confirmPassword"
            label="Կրկնել գաղտնաբառը *"
            placeholder="********"
            startIcon={<LockIconSbg width={17} height={19} />}
            secureTextEntry
            rules={{
              required: 'Կրկնեք գաղտնաբառը',
              validate: (value) =>
                value === getValues('newPassword') || 'Գաղտնաբառերը չեն համընկնում',
            }}
          />
        </View>
      </AnimatedView>
      <AuthButton
        disabled={isSubmitting}
        title="Պահպանել"
        onPress={onSubmit}
        isLoading={isSubmitting}
      />
    </ScrollView>
  );
}
