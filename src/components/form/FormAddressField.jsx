import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { Typography } from '../typography';
import { FONT_FAMILY } from '../../theme';
import { useTheme, useThemedStyles } from '../../hooks';
import { ENV } from '../../config/env';
import {
  filterTestAddresses,
  isGooglePlacesTestKey,
} from '../../config/googlePlaces';

const INPUT_RADIUS = 16;
const MIN_QUERY_LENGTH = 2;

function SuggestionSeparator({ style }) {
  return <View style={style} />;
}

const createStyles = colors =>
  StyleSheet.create({
    field: {
      gap: 8,
      zIndex: 1,
      overflow: 'visible',
    },
    fieldFocused: {
      zIndex: 20,
      elevation: 20,
    },
    autocompleteWrapper: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: INPUT_RADIUS,
      backgroundColor: colors.input,
      overflow: 'visible',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 45,
      paddingHorizontal: 16,
      gap: 10,
    },
    inputError: {
      borderColor: colors.error,
    },
    inputIcon: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      height: 45,
      padding: 0,
      fontSize: 15,
      fontFamily: FONT_FAMILY.regular,
      color: colors.text,
    },
    listView: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.input,
      maxHeight: 220,
      borderBottomLeftRadius: INPUT_RADIUS,
      borderBottomRightRadius: INPUT_RADIUS,
    },
    row: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 44,
      justifyContent: 'center',
    },
    rowText: {
      fontSize: 15,
      fontFamily: FONT_FAMILY.regular,
      color: colors.text,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    errorText: {
      fontSize: 12,
      fontFamily: FONT_FAMILY.regular,
      color: colors.error,
      marginTop: -4,
    },
  });

function createAutocompleteStyles(colors) {
  return {
    container: {
      flexGrow: 0,
      zIndex: 1,
    },
    textInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 45,
      paddingHorizontal: 16,
      gap: 10,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
      borderBottomWidth: 0,
      paddingVertical: 0,
      margin: 0,
    },
    textInput: {
      flex: 1,
      height: 45,
      margin: 0,
      padding: 0,
      fontSize: 15,
      fontFamily: FONT_FAMILY.regular,
      color: colors.text,
      backgroundColor: 'transparent',
    },
    listView: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.input,
      maxHeight: 220,
      marginHorizontal: 0,
      borderRadius: 0,
      borderBottomLeftRadius: INPUT_RADIUS,
      borderBottomRightRadius: INPUT_RADIUS,
    },
    row: {
      backgroundColor: colors.input,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 44,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    description: {
      fontSize: 15,
      fontFamily: FONT_FAMILY.regular,
      color: colors.text,
    },
    poweredContainer: {
      display: 'none',
    },
  };
}

function TestAddressAutocompleteInput({
  value,
  onChange,
  onBlur,
  placeholder,
  startIcon,
  error,
  styles,
  colors,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState(value ?? '');

  useEffect(() => {
    setQuery(value ?? '');
  }, [value]);

  const suggestions = useMemo(
    () => filterTestAddresses(query),
    [query],
  );

  const showSuggestions = isFocused && suggestions.length > 0;

  return (
    <View style={[styles.field, isFocused && styles.fieldFocused]}>
      <View style={[styles.autocompleteWrapper, error && styles.inputError]}>
        <View style={styles.inputRow}>
          {startIcon ? <View style={styles.inputIcon}>{startIcon}</View> : null}
          <TextInput
            style={styles.input}
            value={query}
            placeholder={placeholder}
            placeholderTextColor={colors.textDisabled}
            autoCorrect={false}
            onChangeText={(text) => {
              setQuery(text);
              onChange(text);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              onBlur();
            }}
          />
        </View>
        {showSuggestions ? (
          <View style={styles.listView}>
            {suggestions.map((item, index) => (
              <View key={item}>
                {index > 0 ? <SuggestionSeparator style={styles.separator} /> : null}
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    setQuery(item);
                    onChange(item);
                    setIsFocused(false);
                  }}
                >
                  <Text style={styles.rowText}>{item}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function GoogleAddressAutocompleteInput({
  value,
  onChange,
  onBlur,
  placeholder,
  startIcon,
  name,
  error,
  styles,
  colors,
}) {
  const autocompleteStyles = createAutocompleteStyles(colors);
  const [isFocused, setIsFocused] = useState(false);
  const placesRef = useRef(null);
  const syncedValueRef = useRef(value ?? '');

  useEffect(() => {
    const nextValue = value ?? '';
    if (nextValue !== syncedValueRef.current) {
      placesRef.current?.setAddressText(nextValue);
      syncedValueRef.current = nextValue;
    }
  }, [value]);

  return (
    <View style={[styles.field, isFocused && styles.fieldFocused]}>
      <View style={[styles.autocompleteWrapper, error && styles.inputError]}>
        <GooglePlacesAutocomplete
          ref={placesRef}
          placeholder={placeholder}
          minLength={MIN_QUERY_LENGTH}
          debounce={300}
          enablePoweredByContainer={false}
          fetchDetails={false}
          keepResultsAfterBlur
          listViewDisplayed="auto"
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
          query={{
            key: ENV.GOOGLE_PLACES_API_KEY,
            language: 'hy',
            components: 'country:am',
            types: 'geocode',
          }}
          onPress={(data) => {
            const address = data.description ?? '';
            syncedValueRef.current = address;
            onChange(address);
          }}
          onFail={(message) => {
            console.warn(`[FormAddressField:${name}]`, message);
          }}
          textInputProps={{
            onChangeText: (text) => {
              syncedValueRef.current = text;
              onChange(text);
            },
            onFocus: () => setIsFocused(true),
            onBlur: () => {
              setIsFocused(false);
              onBlur();
            },
            placeholderTextColor: colors.textDisabled,
            autoCorrect: false,
          }}
          renderLeftButton={() =>
            startIcon ? <View style={styles.inputIcon}>{startIcon}</View> : null
          }
          styles={autocompleteStyles}
        />
      </View>
    </View>
  );
}

function AddressAutocompleteInput({ useGoogleAutocomplete = false, ...props }) {
  const hasRealGoogleKey = !isGooglePlacesTestKey(ENV.GOOGLE_PLACES_API_KEY);

  if (useGoogleAutocomplete && hasRealGoogleKey) {
    return <GoogleAddressAutocompleteInput {...props} />;
  }

  return <TestAddressAutocompleteInput {...props} />;
}

export function FormAddressField({
  control,
  name,
  label,
  placeholder,
  rules,
  startIcon,
  labelVariant = 'h6',
  useGoogleAutocomplete = false,
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={{ gap: 8 }}>
          {label ? <Typography variant={labelVariant}>{label}</Typography> : null}
          <AddressAutocompleteInput
            useGoogleAutocomplete={useGoogleAutocomplete}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            startIcon={startIcon}
            name={name}
            error={error}
            styles={styles}
            colors={colors}
          />
          {error?.message ? <Text style={styles.errorText}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
}
