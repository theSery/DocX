import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Typography } from '../typography';
import { FONT_FAMILY } from '../../theme';
import { useThemedStyles } from '../../hooks';

const INPUT_RADIUS = 16;
export const DATE_FIELD_PLACEHOLDER = 'ՕՕ / ԱԱ / ՏՏՏՏ';
const DATE_PICKER_LOCALE = 'hy-AM';

function formatDateDisplay(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day} / ${month} / ${year}`;
}

const createStyles = colors =>
  StyleSheet.create({
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 45,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: INPUT_RADIUS,
      backgroundColor: colors.input,
      paddingHorizontal: 16,
      gap: 10,
    },
    inputIcon: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    valueText: {
      flex: 1,
      fontSize: 15,
      fontFamily: FONT_FAMILY.regular,
      color: colors.text,
    },
    placeholderText: {
      color: colors.textDisabled,
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      fontSize: 12,
      fontFamily: FONT_FAMILY.regular,
      color: colors.error,
      marginTop: -4,
    },
    iosModalBackdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    iosPickerSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 24,
    },
    iosPickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    iosPickerAction: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.regular,
      color: colors.primary,
    },
    iosPickerActionMuted: {
      color: colors.textSecondary,
    },
  });

export function FormDateField({
  control,
  name,
  label,
  placeholder = DATE_FIELD_PLACEHOLDER,
  rules,
  startIcon,
  labelVariant = 'h6',
  maximumDate,
  minimumDate,
  buttonStyle,
  textStyle,
}) {
  const styles = useThemedStyles(createStyles);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const [showIosPicker, setShowIosPicker] = useState(false);
  const [iosDraftDate, setIosDraftDate] = useState(new Date());

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        const selectedDate = value instanceof Date ? value : null;
        const displayText = selectedDate ? formatDateDisplay(selectedDate) : placeholder;
        const isPlaceholder = !selectedDate;

        const openPicker = () => {
          const initialDate = selectedDate ?? new Date();
          if (Platform.OS === 'ios') {
            setIosDraftDate(initialDate);
            setShowIosPicker(true);
            return;
          }
          setShowAndroidPicker(true);
        };

        const closeIosPicker = (commit) => {
          if (commit) {
            onChange(iosDraftDate);
          }
          onBlur();
          setShowIosPicker(false);
        };

        const closeAndroidPicker = () => {
          setShowAndroidPicker(false);
          onBlur();
        };

        return (
          <View style={{ gap: 8 }}>
            {label ? <Typography variant={labelVariant}>{label}</Typography> : null}
            <Pressable
              onPress={openPicker}
              style={[styles.inputRow, error && styles.inputError, buttonStyle]}
              accessibilityRole="button"
            >
              {startIcon ? <View style={styles.inputIcon}>{startIcon}</View> : null}
              <Text
                style={[styles.valueText, isPlaceholder && styles.placeholderText,textStyle]}
                numberOfLines={1}
              >
                {displayText}
              </Text>
            </Pressable>
            {error?.message ? (
              <Text style={styles.errorText}>{error.message}</Text>
            ) : null}

            {Platform.OS === 'android' && showAndroidPicker ? (
              <DateTimePicker
                value={selectedDate ?? new Date()}
                mode="date"
                display="default"
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                title="Ընտրել ամսաթիվ"
                positiveButton={{ label: 'Ընտրել' }}
                negativeButton={{ label: 'Չեղարկել' }}
                onChange={(event, date) => {
                  if (event.type === 'dismissed' || !(date instanceof Date)) {
                    closeAndroidPicker();
                    return;
                  }

                  onChange(date);
                  closeAndroidPicker();
                }}
                onDismiss={closeAndroidPicker}
              />
            ) : null}

            {Platform.OS === 'ios' ? (
              <Modal
                visible={showIosPicker}
                transparent
                animationType="fade"
                onRequestClose={() => closeIosPicker(false)}
              >
                <Pressable
                  style={styles.iosModalBackdrop}
                  onPress={() => closeIosPicker(false)}
                >
                  <Pressable style={styles.iosPickerSheet} onPress={() => {}}>
                    <View style={styles.iosPickerHeader}>
                      <Pressable onPress={() => closeIosPicker(false)} hitSlop={8}>
                        <Text style={[styles.iosPickerAction, styles.iosPickerActionMuted]}>
                        Փակել
                        </Text>
                      </Pressable>
                      <Pressable onPress={() => closeIosPicker(true)} hitSlop={8}>
                        <Text style={styles.iosPickerAction}>Ընտրել</Text>
                      </Pressable>
                    </View>
                    <DateTimePicker
                      value={iosDraftDate}
                      mode="date"
                      display="spinner"
                      locale={DATE_PICKER_LOCALE}
                      maximumDate={maximumDate}
                      minimumDate={minimumDate}
                      onValueChange={(_, date) => setIosDraftDate(date)}
                      themeVariant="light"
                    />
                  </Pressable>
                </Pressable>
              </Modal>
            ) : null}
          </View>
        );
      }}
    />
  );
}
