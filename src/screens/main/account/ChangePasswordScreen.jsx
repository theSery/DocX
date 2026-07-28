import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { AnimatedView, FormField, FormScrollView } from '../../../components';
import AuthButton from '../../../components/buttons/AuthButton';
import LockIconSbg from '../../../components/icons/LockIconSbg';
import { authApi } from '../../../api';
import { useGlobalStyles, useThemedStyles, useTheme, useToast } from '../../../hooks';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';
import { PASSWORD_STRENGTH_RULE } from '../../../utils/patterns';

const createStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 16,
    },
    scroll: {
      flex: 1,
    },
    contentContainer: {
      width: '100%',
    },
    content: {
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      paddingTop: 20,
    },
    formFieldContainer: {
      width: '100%',
      marginTop: 20,
      gap: 20,
    },
    footer: {
      paddingTop: 12,
      backgroundColor: colors.background,
    },
  });

export function ChangePasswordScreen() {
  const globalStyles = useGlobalStyles();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      await authApi.changePassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
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
    <View style={[globalStyles.screen, styles.screen]}>
      <FormScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <AnimatedView animation="fadeIn" duration={500} style={styles.content}>
          <View style={styles.formFieldContainer}>
            <FormField
              control={control}
              name="currentPassword"
              label="Գաղտնաբառ *"
              placeholder="********"
              startIcon={<LockIconSbg fill={colors.icons} width={20} height={20} />}
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
              startIcon={<LockIconSbg fill={colors.icons} width={20} height={20} />}
              secureTextEntry
              rules={{
                required: 'Նոր գաղտնաբառը պարտադիր է',
                ...PASSWORD_STRENGTH_RULE,
              }}
            />
            <FormField
              control={control}
              name="confirmPassword"
              label="Կրկնել գաղտնաբառը *"
              placeholder="********"
              startIcon={<LockIconSbg fill={colors.icons} width={20} height={20} />}
              secureTextEntry
              rules={{
                required: 'Կրկնեք գաղտնաբառը',
                validate: (value) =>
                  value === getValues('newPassword') || 'Գաղտնաբառերը չեն համընկնում',
              }}
            />
          </View>
        </AnimatedView>
      </FormScrollView>
      <View style={[styles.footer, { paddingBottom: TAB_BAR_BOTTOM_OFFSET }]}>
        <AuthButton
          disabled={isSubmitting}
          title="Պահպանել"
          onPress={onSubmit}
          isLoading={isSubmitting}
        />
      </View>
    </View>
  );
}
