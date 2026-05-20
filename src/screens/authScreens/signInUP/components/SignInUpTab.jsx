import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useForm } from 'react-hook-form';
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
import { FormField } from '../../../../components';
import { LoginTabs } from './LoginTabs';

const CORNER_RADIUS = 30;
const CONTAINER_TOP = 56;
const TAB_TIMING = { duration: 350 };
const CONTENT_PADDING = 24;

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
    <Animated.Text style={[styles.tabLabel, animatedStyle]}>{label}</Animated.Text>
  );
}

function RegistrationForm() {
  const { control, getValues } = useForm({
    defaultValues: { email: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  return (
    <View style={styles.form}>
      <Text style={styles.registerHeading}>ՍՏԵՂԾԵԼ ՆՈՐ ՀԱՇԻՎ</Text>
      <FormField
        control={control}
        name="email"
        label="Էլ.-փոստ *"
        placeholder="example@docx.am"
        rules={{
          required: 'Էլ.-փոստը պարտադիր է',
          pattern: { value: EMAIL_PATTERN, message: 'Մուտքագրեք վավեր էլ.-փոստ' },
        }}
      />
      <FormField
        control={control}
        name="password"
        label="Ստեղծել նոր գաղտնաբառ *"
        placeholder="********"
        secureTextEntry
        rules={{
          required: 'Գաղտնաբառը պարտադիր է',
          minLength: { value: 6, message: 'Առնվազն 6 նիշ' },
        }}
      />
      <FormField
        control={control}
        name="confirmPassword"
        label="Կրկնել գաղտնաբառը *"
        placeholder="********"
        secureTextEntry
        rules={{
          required: 'Կրկնեք գաղտնաբառը',
          validate: value =>
            value === getValues('password') || 'Գաղտնաբառերը չեն համընկնում',
        }}
      />
      <Text style={styles.privacyText}>
        Գրանցվելով դուք համաձայնում եք մեր Գաղտնիության քաղաքականության և
        Օգտագործման պայմաններին։
      </Text>
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

      <KeyboardAvoidingView
        style={styles.formArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.formsStack}>
            {tabIndex === 0 ? (
              <Animated.View
                style={[styles.formPanel, loginFormStyle]}
                pointerEvents={tabIndex === 0 ? 'auto' : 'none'}>
                <LoginTabs onPhoneLogin={onPhoneLogin} />
              </Animated.View>
            ) : (
              <Animated.View
                style={[styles.formPanel, styles.formPanelOverlay, registerFormStyle]}
                pointerEvents={tabIndex === 1 ? 'auto' : 'none'}>
                <RegistrationForm />
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: -AUTH_SCREEN_HORIZONTAL_PADDING,
    minHeight: 420,
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
    flexGrow: 1,
    paddingHorizontal: CONTENT_PADDING,
    paddingTop: 8,
    paddingBottom: 32,
  },
  formsStack: {
    minHeight: 360,
  },
  formPanel: {
    width: '100%',
  },
  formPanelOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
  },
  form: {
    gap: 16,
  },
  registerHeading: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.semiBold,
    color: palette.gray,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: FONT_FAMILY.regular,
    color: palette.gray,
    marginTop: 4,
    marginBottom: 8,
  },
});
