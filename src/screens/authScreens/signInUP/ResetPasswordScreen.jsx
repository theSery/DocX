import { ScrollView, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { AuthScreenLayout } from '../../../components/layout';
import {
  useAuthScreenStyles,
  useTheme,
  useThemedFocusStatusBar,
  useThemedStyles,
  useToast,
} from '../../../hooks';
import MainHeader from '../../../components/headers/MainHeader';
import { FormField } from '../../../components';
import AuthButton from '../../../components/buttons/AuthButton';
import LockIconSbg from '../../../components/icons/LockIconSbg';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { authApi } from '../../../api';
import { PASSWORD_STRENGTH_RULE } from '../../../utils/patterns';

export function ResetPasswordScreen({ navigation, route }) {
  const styles = useAuthScreenStyles();
  const localStyles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  useThemedFocusStatusBar();
  const { email, code } = route.params ?? {};

  const {
    control,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(async values => {
    try {
      await authApi.resetPassword({
        email,
        code,
        newPassword: values.password,
      });
      showToast({
        title: 'Գաղտնաբառը հաջողությամբ փոխվեց',
        body: 'Այժմ կարող եք մուտք գործել նոր գաղտնաբառով',
        type: 'success',
      });
      navigation.navigate('SignInUp');
    } catch (error) {
      showToast({
        title: 'Վերականգնումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    }
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
        contentContainerStyle={localStyles.scrollContent}
      >
        <View style={localStyles.content}>
          <View style={localStyles.formContainer}>
            <ContentTiltes
              title="Վերականգնել գաղտնաբառը"
              subtitle="Ստեղծեք նոր գաղտնաբառ Ձեր հաշվի համար"
            />
            <View style={localStyles.fields}>
              <FormField
                control={control}
                name="password"
                label="Ստեղծել նոր գաղտնաբառ *"
                placeholder="********"
                startIcon={
                  <LockIconSbg width={17} height={19} fill={colors.icons} />
                }
                secureTextEntry
                rules={{
                  required: 'Գաղտնաբառը պարտադիր է',
                  ...PASSWORD_STRENGTH_RULE,
                }}
              />
              <FormField
                control={control}
                name="confirmPassword"
                label="Կրկնել գաղտնաբառը *"
                placeholder="********"
                startIcon={
                  <LockIconSbg width={17} height={19} fill={colors.icons} />
                }
                secureTextEntry
                rules={{
                  required: 'Կրկնեք գաղտնաբառը',
                  validate: value =>
                    value === getValues('password') ||
                    'Գաղտնաբառերը չեն համընկնում',
                }}
              />
            </View>
          </View>

          <View style={localStyles.buttonContainer}>
            <AuthButton
              title="Պահպանել"
              onPress={onSubmit}
              isLoading={isSubmitting}
            />
          </View>
        </View>
      </ScrollView>
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
    fields: {
      width: '100%',
      marginTop: 20,
      gap: 20,
    },
    buttonContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      width: '100%',
    },
    formArea: {
      flex: 1,
      width: '100%',
    },
    scrollContent: {
      flexGrow: 1,
      width: '100%',
    },
  });
