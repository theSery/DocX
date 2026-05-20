import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FONT_FAMILY, palette } from '../../../../theme';
import { FormField, Typography } from '../../../../components';
import GradientButton from '../../../../components/buttons/GradientButton';
import MailIconSvg from '../../../../components/icons/MailIconSvg';
import LockIconSbg from '../../../../components/icons/LockIconSbg';
import PhoneSvg from '../../../../components/icons/PhoneSvg';

const INPUT_RADIUS = 16;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function OrDivider() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Typography style={styles.dividerText}>կամ</Typography>
      <View style={styles.dividerLine} />
    </View>
  );
}

function OutlineButton({ title, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.outlineButton, pressed && styles.buttonPressed]}
      onPress={onPress}>
      <PhoneSvg width={20} height={20} fill={palette.mainBlue} />
      <Typography variant="h5" style={styles.outlineButtonText}>
        {title}
      </Typography>
    </Pressable>
  );
}

export function LoginTabs({ onPhoneLogin }) {
  const { control } = useForm({
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  return (
    <View style={[styles.form, styles.formTop]}>
      <Typography variant="h4" style={styles.loginTitle}>
        ՄՈՒՏՔ էԼ-ՓՈՍՏՈՎ
      </Typography>
      <FormField
        control={control}
        name="email"
        label="Էլ.-փոստ"
        placeholder="example@docx.am"
        startIcon={<MailIconSvg width={19} height={15} />}
        rules={{
          required: 'Էլ.-փոստը պարտադիր է',
          pattern: { value: EMAIL_PATTERN, message: 'Մուտքագրեք վավեր էլ.-փոստ' },
        }}
      />
      <FormField
        control={control}
        name="password"
        label="Գաղտնաբառ"
        placeholder="********"
        startIcon={<LockIconSbg width={17} height={19} />}
        secureTextEntry
        rules={{
          required: 'Գաղտնաբառը պարտադիր է',
          minLength: { value: 6, message: 'Առնվազն 6 նիշ' },
        }}
      />
      <Pressable style={styles.forgotLink} hitSlop={8}>
        <Typography style={styles.forgotLinkText}>Մոռացե՞լ եք գաղտնաբառը</Typography>
      </Pressable>
      <View style={styles.actions}>
        <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
          <GradientButton height={45} isLight={false}>
            <Typography variant="h5" style={styles.primaryButtonText}>
              Մուտք գործել
            </Typography>
          </GradientButton>
        </Pressable>
        <OrDivider />
        <OutlineButton title="Մուտք հեռախոսահամարով" onPress={onPhoneLogin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  formTop: {
    marginTop: 30,
  },
  actions: {
    marginTop: 20,
  },
  forgotLink: {
    alignSelf: 'flex-start',
    marginTop: -4,
    marginBottom: 4,
  },
  forgotLinkText: {
    fontSize: 8,
    fontFamily: FONT_FAMILY.semiBold,
    color: palette.mainBlue,
    textDecorationLine: 'underline',
  },
  primaryButton: {
    height: 45,
    overflow: 'hidden',
    borderRadius: INPUT_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontFamily: FONT_FAMILY.regular,
    color: palette.white,
    letterSpacing: 1.2,
  },
  outlineButton: {
    height: 45,
    borderRadius: INPUT_RADIUS,
    borderWidth: 1,
    borderColor: palette.mainBlue,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  outlineButtonText: {
    color: palette.mainBlue,
    letterSpacing: 1.2,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.gray,
  },
  dividerText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.regular,
    color: palette.lightGray,
  },
  loginTitle: {
    fontFamily: FONT_FAMILY.medium,
    letterSpacing: 1.2,
    marginBottom: 4,
    textAlign: 'center',
  },
});
