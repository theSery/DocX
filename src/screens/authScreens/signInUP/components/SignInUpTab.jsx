import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
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
import { FONT_FAMILY, palette } from '../../../../theme';
import { FormField, Typography } from '../../../../components';
import { LoginTabs } from './LoginTabs';
import LockIconSbg from '../../../../components/icons/LockIconSbg';
import GradientButton from '../../../../components/buttons/GradientButton';

const CORNER_RADIUS = 30;
const CONTAINER_TOP = 56;
const TAB_TIMING = { duration: 350 };
const CONTENT_PADDING = 24;
const SCREEN_HEIGHT = Dimensions.get('window').height / 2;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function TabLabel({ activeTab, index, label }) {
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      activeTab.value,
      [0, 1],
      index === 0
        ? [palette.mainBlue, palette.white]
        : [palette.white, palette.mainBlue],
    ),
  }));

  return (
    <Animated.Text style={[styles.tabLabel, animatedStyle]}>
      {label}
    </Animated.Text>
  );
}

function RegistrationForm() {
  const navigation = useNavigation();
  const {
    control,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(values => {
    navigation.navigate('Registration', {
      email: values.email,
      password: values.password,
    });
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
          startIcon={<MailIconSvg width={19} height={15} />}
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
            startIcon={<LockIconSbg width={17} height={19} />}
            secureTextEntry
            rules={{
              required: 'Գաղտնաբառը պարտադիր է',
              minLength: { value: 6, message: 'Առնվազն 6 նիշ' },
            }}
          />
        </View>
        <FormField
          control={control}
          name="confirmPassword"
          label="Կրկնել գաղտնաբառը *"
          placeholder="********"
          startIcon={<LockIconSbg width={17} height={19} />}
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
        <Pressable
          onPress={onSubmit}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <GradientButton height={45} isLight={false}>
            <Typography variant="h5" style={styles.primaryButtonText}>
            Գրանցվել
            </Typography>
          </GradientButton>
        </Pressable>
      </View>
    </View>
  );
}

export function SignInUpTab({ onPhoneLogin }) {
  const activeTab = useSharedValue(0);
  const layoutWidth = useSharedValue(0);
  const layoutHeight = useSharedValue(0);
  const [tabIndex, setTabIndex] = useState(0);

  const animatedPath = useDerivedValue(() => {
    const width = layoutWidth.value;
    const height = layoutHeight.value;

    if (width <= 0 || height <= 0) {
      return Skia.Path.Make();
    }

    const customPath = Skia.Path.Make();
    const tabWidth = width / 2;

    const cutoutLeft = interpolate(activeTab.value, [0, 1], [0, tabWidth]);
    const cutoutRight = cutoutLeft + tabWidth;
    const leftRadius = interpolate(activeTab.value, [0, 1], [0, CORNER_RADIUS]);
    const rightRadius = interpolate(
      activeTab.value,
      [0, 1],
      [CORNER_RADIUS, 0],
    );

    customPath.moveTo(0, height);
    customPath.lineTo(0, CONTAINER_TOP + leftRadius);
    customPath.quadTo(0, CONTAINER_TOP, leftRadius, CONTAINER_TOP);

    if (cutoutLeft > leftRadius) {
      customPath.lineTo(cutoutLeft - leftRadius, CONTAINER_TOP);
    }

    customPath.quadTo(
      cutoutLeft,
      CONTAINER_TOP,
      cutoutLeft,
      CONTAINER_TOP - leftRadius,
    );

    customPath.lineTo(cutoutLeft, CORNER_RADIUS);
    customPath.quadTo(cutoutLeft, 0, cutoutLeft + CORNER_RADIUS, 0);
    customPath.lineTo(cutoutRight - CORNER_RADIUS, 0);

    customPath.quadTo(cutoutRight, 0, cutoutRight, CORNER_RADIUS);
    customPath.lineTo(cutoutRight, CONTAINER_TOP - CORNER_RADIUS);

    if (cutoutRight < width - rightRadius) {
      customPath.quadTo(
        cutoutRight,
        CONTAINER_TOP,
        cutoutRight + CORNER_RADIUS,
        CONTAINER_TOP,
      );
    } else {
      customPath.quadTo(
        cutoutRight,
        CONTAINER_TOP,
        width - rightRadius,
        CONTAINER_TOP,
      );
    }

    if (cutoutRight < width - rightRadius) {
      customPath.lineTo(width - rightRadius, CONTAINER_TOP);
    }

    customPath.quadTo(width, CONTAINER_TOP, width, CONTAINER_TOP + rightRadius);
    customPath.lineTo(width, height);
    customPath.close();

    return customPath;
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
        <Path path={animatedPath} color={palette.white} />
      </Canvas>

      <View style={styles.tabRow}>
        <Pressable style={styles.tabButton} onPress={() => handleTabPress(0)}>
          <TabLabel activeTab={activeTab} index={0} label="Մուտք" />
        </Pressable>
        <Pressable style={styles.tabButton} onPress={() => handleTabPress(1)}>
          <TabLabel activeTab={activeTab} index={1} label="Գրանցում" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.formArea}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
