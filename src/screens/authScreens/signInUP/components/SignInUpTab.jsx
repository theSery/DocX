import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import MailIconSvg from '../../../../components/icons/MailIconSvg';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AUTH_SCREEN_HORIZONTAL_PADDING } from '../../../../components/layout/authLayoutConstants';
import { FONT_FAMILY } from '../../../../theme';
import { FormField, FormScrollView, Typography } from '../../../../components';
import { LoginTabs } from './LoginTabs';
import LockIconSbg from '../../../../components/icons/LockIconSbg';
import AuthButton from '../../../../components/buttons/AuthButton';
import { authApi } from '../../../../api';
import { useTheme, useThemedStyles, useToast } from '../../../../hooks';
import { PASSWORD_STRENGTH_RULE } from '../../../../utils/patterns';

const CORNER_RADIUS = 30;
const CONTAINER_TOP = 56;
const TAB_TIMING = { duration: 350 };
const CONTENT_PADDING = 24;
const SCREEN_HEIGHT = Dimensions.get('window').height / 2;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function TabLabel({ activeTab, index, label, activeColor, inactiveColor }) {
  const styles = useThemedStyles(createStyles);
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      activeTab.value,
      [0, 1],
      index === 0
        ? [activeColor, inactiveColor]
        : [inactiveColor, activeColor],
    ),
  }));

  return (
    <Animated.Text style={[styles.tabLabel, animatedStyle]}>
      {label}
    </Animated.Text>
  );
}

function RegistrationForm() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const {
    control,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  });
  const isLoading = isSubmitting;

  const onSubmit = handleSubmit(async values => {
    try {
      const response = await authApi.sendOtp({
        email: values.email,
        purpose: 'register',
      });

      navigation.navigate('EmailVerification', {
        email: values.email,
        password: values.password,
        purpose: 'register',
      });
      showToast({
        title: 'Մուտքագրեք Ձեր ',
        body: `${values.email} էլ-փոստին ուղարկված կոդը`,
        type: 'success',
      });
      console.log('Send OTP response:', response);
    } catch (error) {
      console.log('Send OTP error:', error);
      if (error?.status === 400) {
        navigation.navigate('Registration', {
          email: values.email,
          password: values.password,
        });
        return;
      }
      showToast({
        title: 'Գրանցումը ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    }
  });

  return (
    <View
      style={[
        styles.form,
        { height: SCREEN_HEIGHT, justifyContent: 'space-between' },
      ]}
    >
      <>
        <Typography variant="h4" style={styles.loginTitle}>
          ՍՏԵՂԾԵԼ ՆՈՐ ՀԱՇԻՎ
        </Typography>
        <FormField
          control={control}
          name="email"
          label="Էլ.-փոստ *"
          startIcon={<MailIconSvg width={19} height={15} fill={colors.icons} />}
          placeholder="example@docx.am"
          rules={{
            required: 'Էլ.-փոստը պարտադիր է',
            pattern: {
              value: EMAIL_PATTERN,
              message: 'Մուտքագրեք վավեր էլ.-փոստ',
            },
          }}
        />
        <View style={{ marginVertical: 20 }}>
          <FormField
            control={control}
            name="password"
            label="Ստեղծել նոր գաղտնաբառ *"
            placeholder="********"
            startIcon={<LockIconSbg width={17} height={19} fill={colors.icons} />}
            secureTextEntry
            rules={{
              required: 'Գաղտնաբառը պարտադիր է',
              ...PASSWORD_STRENGTH_RULE,
            }}
          />
        </View>
        <FormField
          control={control}
          name="confirmPassword"
          label="Կրկնել գաղտնաբառը *"
          placeholder="********"
          startIcon={<LockIconSbg width={17} height={19} fill={colors.icons} />}
          secureTextEntry
          rules={{
            required: 'Կրկնեք գաղտնաբառը',
            validate: value =>
              value === getValues('password') || 'Գաղտնաբառերը չեն համընկնում',
          }}
        />
      </>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Text style={styles.privacyText}>
          Գրանցվելով՝ Դուք համաձայնվում եք{'  '}
          <Text style={styles.privacyTextBold} onPress={() => Linking.openURL('https://www.google.com')}>
            Օգտագործման պայմաններին և դրույթներին
          </Text>
          {'  '} և{'  '}
          <Text style={styles.privacyTextBold} Press={() => Linking.openURL('https://www.google.com')}>
            Գաղտնիության քաղաքականությանը
          </Text>
        </Text>
        <AuthButton
          title="Գրանցվել"
          onPress={onSubmit}
          isLoading={isLoading}
        />
      </View>
    </View>
  );
}

export function SignInUpTab({ onPhoneLogin }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const activeTab = useSharedValue(0);
  const layoutWidth = useSharedValue(0);
  const layoutHeight = useSharedValue(0);
  const [tabIndex, setTabIndex] = useState(0);

  const animatedPath = useDerivedValue(() => {
    const width = layoutWidth.value;
    const height = layoutHeight.value;

    if (width <= 0 || height <= 0) {
      return Skia.PathBuilder.Make().detach();
    }

    const builder = Skia.PathBuilder.Make();
    const tabWidth = width / 2;

    const cutoutLeft = interpolate(activeTab.value, [0, 1], [0, tabWidth]);
    const cutoutRight = cutoutLeft + tabWidth;
    const leftRadius = interpolate(activeTab.value, [0, 1], [0, CORNER_RADIUS]);
    const rightRadius = interpolate(
      activeTab.value,
      [0, 1],
      [CORNER_RADIUS, 0],
    );

    builder.moveTo(0, height);
    builder.lineTo(0, CONTAINER_TOP + leftRadius);
    builder.quadTo(0, CONTAINER_TOP, leftRadius, CONTAINER_TOP);

    if (cutoutLeft > leftRadius) {
      builder.lineTo(cutoutLeft - leftRadius, CONTAINER_TOP);
    }

    builder.quadTo(
      cutoutLeft,
      CONTAINER_TOP,
      cutoutLeft,
      CONTAINER_TOP - leftRadius,
    );

    builder.lineTo(cutoutLeft, CORNER_RADIUS);
    builder.quadTo(cutoutLeft, 0, cutoutLeft + CORNER_RADIUS, 0);
    builder.lineTo(cutoutRight - CORNER_RADIUS, 0);

    builder.quadTo(cutoutRight, 0, cutoutRight, CORNER_RADIUS);
    builder.lineTo(cutoutRight, CONTAINER_TOP - CORNER_RADIUS);

    if (cutoutRight < width - rightRadius) {
      builder.quadTo(
        cutoutRight,
        CONTAINER_TOP,
        cutoutRight + CORNER_RADIUS,
        CONTAINER_TOP,
      );
    } else {
      builder.quadTo(
        cutoutRight,
        CONTAINER_TOP,
        width - rightRadius,
        CONTAINER_TOP,
      );
    }

    if (cutoutRight < width - rightRadius) {
      builder.lineTo(width - rightRadius, CONTAINER_TOP);
    }

    builder.quadTo(width, CONTAINER_TOP, width, CONTAINER_TOP + rightRadius);
    builder.lineTo(width, height);
    builder.close();

    return builder.detach();
  });

  const handleTabPress = useCallback(
    index => {
      activeTab.value = withTiming(index, TAB_TIMING);
      setTabIndex(index);
    },
    [activeTab],
  );

  const onLayout = useCallback(
    event => {
      const { width, height } = event.nativeEvent.layout;
      layoutWidth.value = width;
      layoutHeight.value = height;
    },
    [layoutWidth, layoutHeight],
  );

  const loginFormStyle = useAnimatedStyle(() => ({
    opacity: interpolate(activeTab.value, [0, 1], [1, 0]),
  }));

  const registerFormStyle = useAnimatedStyle(() => ({
    opacity: interpolate(activeTab.value, [0, 1], [0, 1]),
  }));

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Path path={animatedPath} color={colors.surface} />
      </Canvas>

      <View style={styles.tabRow}>
        <Pressable style={styles.tabButton} onPress={() => handleTabPress(0)}>
          <TabLabel
            activeTab={activeTab}
            index={0}
            label="Մուտք"
            activeColor={colors.icons}
            inactiveColor={colors.buttonTextOnPrimary}
          />
        </Pressable>
        <Pressable style={styles.tabButton} onPress={() => handleTabPress(1)}>
          <TabLabel
            activeTab={activeTab}
            index={1}
            label="Գրանցում"
            activeColor={colors.icons}
            inactiveColor={colors.buttonTextOnPrimary}
          />
        </Pressable>
      </View>

      <FormScrollView
        style={styles.formArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formsStack}>
          {tabIndex === 0 ? (
            <Animated.View
              style={[styles.formPanel, loginFormStyle]}
              pointerEvents={tabIndex === 0 ? 'auto' : 'none'}
            >
              <LoginTabs onPhoneLogin={onPhoneLogin} />
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                styles.formPanel,
                styles.formPanelOverlay,
                registerFormStyle,
              ]}
              pointerEvents={tabIndex === 1 ? 'auto' : 'none'}
            >
              <RegistrationForm />
            </Animated.View>
          )}
        </View>
      </FormScrollView>
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    marginHorizontal: -AUTH_SCREEN_HORIZONTAL_PADDING,
  },
  tabRow: {
    flexDirection: 'row',
    height: CONTAINER_TOP,
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.regular,
    letterSpacing: 2,
  },
  formArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: CONTENT_PADDING,
    paddingTop: 8,
  },
  formsStack: {
    height: '100%',
  },
  formPanel: {
    width: '100%',
    height: '100%',
  },
  formPanelOverlay: {
    ...StyleSheet.absoluteFill,
    top: 0,
  },
  form: {
    marginTop: 20,
  },
  loginTitle: {
    fontFamily: FONT_FAMILY.medium,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 20,
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
