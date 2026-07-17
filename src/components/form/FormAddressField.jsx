import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { Typography } from '../typography';
import { FONT_FAMILY } from '../../theme';
import { useTheme, useThemedStyles } from '../../hooks';
import { ENV } from '../../config/env';
import LocationSvg from '../icons/LocationSvg';

const INPUT_RADIUS = 16;
const MIN_QUERY_LENGTH = 2;

/**
 * Prop types derived from the library's own definitions
 * (react-native-google-places-autocomplete/GooglePlacesAutocomplete.d.ts).
 * `Query`, `Language`, `AutocompleteRequestType`, etc. are not exported from
 * the package, so we reference them through the component's props instead.
 * @typedef {import('react').ComponentProps<typeof GooglePlacesAutocomplete>} GooglePlacesAutocompleteProps
 */

/**
 * `region` is supported by the Place Details API but missing from the
 * library's `Query` interface, hence the intersection.
 * @type {GooglePlacesAutocompleteProps['GooglePlacesDetailsQuery'] & { region?: string }}
 */
const PLACES_DETAILS_QUERY = {
  fields: 'address_component,formatted_address,geometry,name',
  language: 'hy',
  region: 'am',
};

/**
 * The `query` prop is declared as `Query | Object`; extract the `Query`
 * interface (the union member with a required `key`) so the object is
 * actually type-checked.
 * @type {Extract<GooglePlacesAutocompleteProps['query'], { key: string }>}
 */
const PLACES_QUERY = {
  key: ENV.GOOGLE_PLACES_API_KEY,
  language: 'hy',
  components: 'country:am',
  region: 'am',
  // No `type` restriction: like the Google Maps search box, return
  // everything — addresses, streets, districts, cities, and places
  // (businesses, landmarks, metro stations, etc.).
  // Bias results toward Yerevan (same as Google Maps centered on the
  // city) without hard-restricting them, so anything in Armenia
  // still shows up.
  location: '40.1772,44.5133',
  radius: 20000,
};

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const ARMENIAN_SCRIPT_REGEX = /[\u0530-\u058F]/;
const LATIN_SCRIPT_REGEX = /[A-Za-z]/;

function getAddressComponent(components, type) {
  return components?.find((component) => component.types?.includes(type))?.long_name ?? '';
}

/**
 * Google's formatted_address usually contains street + building number + city,
 * but omits premise/subpremise (building/apartment identifiers), so we merge
 * those in right after the street segment when they are present.
 */
function mergeExtraComponents(formatted, components) {
  if (!formatted || !components?.length) {
    return formatted;
  }

  const extras = ['premise', 'subpremise']
    .map((type) => getAddressComponent(components, type))
    .filter((part) => part && !formatted.includes(part));

  if (!extras.length) {
    return formatted;
  }

  const [street, ...rest] = formatted.split(', ');
  return [street, ...extras, ...rest].filter(Boolean).join(', ');
}

/**
 * Returns the most detailed address string available for the selected place.
 */
function buildDetailedAddress(data, details) {
  let formatted = details?.formatted_address ?? data?.description ?? '';

  // For POIs/establishments (like Google Maps results) the place name is not
  // part of formatted_address, so prepend it to keep the selection meaningful.
  const placeName = details?.name;
  if (placeName && !formatted.includes(placeName)) {
    formatted = [placeName, formatted].filter(Boolean).join(', ');
  }

  return mergeExtraComponents(formatted, details?.address_components);
}

async function geocodeInArmenian(params) {
  const query = Object.entries({
    ...params,
    language: 'hy',
    region: 'am',
    key: ENV.GOOGLE_PLACES_API_KEY,
  })
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  const response = await fetch(`${GEOCODE_URL}?${query}`);
  const json = await response.json();
  if (json?.status !== 'OK' || !json.results?.length) {
    return null;
  }

  const result = json.results[0];
  const formatted = mergeExtraComponents(result.formatted_address ?? '', result.address_components);
  return ARMENIAN_SCRIPT_REGEX.test(formatted) ? formatted : null;
}

/**
 * The Places responses sometimes come back in English even with
 * `language: 'hy'`. The Geocoding API has better Armenian coverage, so we
 * re-resolve the exact same place there: first by place_id (guaranteed to be
 * the identical place), then by its coordinates as a fallback.
 */
async function fetchArmenianAddress({ placeId, location }) {
  try {
    if (placeId) {
      const byPlaceId = await geocodeInArmenian({ place_id: placeId });
      if (byPlaceId) {
        return byPlaceId;
      }
    }

    const lat = location?.lat;
    const lng = location?.lng;
    if (lat != null && lng != null) {
      return await geocodeInArmenian({ latlng: `${lat},${lng}` });
    }
  } catch (error) {
    console.warn('[FormAddressField] Armenian localization failed', error);
  }

  return null;
}

const createStyles = colors =>
  StyleSheet.create({
    container: {
      gap: 8,
    },
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
    inputError: {
      borderColor: colors.error,
    },
    inputIcon: {
      justifyContent: 'center',
      alignItems: 'center',
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
      // Render the results above the input so the keyboard never hides them.
      position: 'absolute',
      bottom: '100%',
      left: 0,
      right: 0,
      marginBottom: 4,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.input,
      maxHeight: 220,
      marginHorizontal: 0,
      borderRadius: INPUT_RADIUS,
      overflow: 'hidden',
      zIndex: 30,
      elevation: 30,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -4 },
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

const createRowStyles = colors =>
  StyleSheet.create({
    primaryText: {
      fontSize: 15,
      fontFamily: FONT_FAMILY.medium,
      color: colors.text,
    },
    secondaryText: {
      fontSize: 13,
      fontFamily: FONT_FAMILY.regular,
      color: colors.textDisabled,
      marginTop: 2,
    },
    iconContainer: {
      position: 'absolute',
      right: 0,
      top: 0,
      // backgroundColor: 'red',
    },
  });

// Two-line rows like the Google Maps search dropdown: place/street name on
// top, the rest of the address underneath.
function renderSuggestionRow(data, rowStyles) {
  const primary = data?.structured_formatting?.main_text ?? data?.description ?? '';
  const secondary = data?.structured_formatting?.secondary_text ?? '';

  return (
    <View style={{ position: 'relative', width: '100%' }}>
      <Text style={rowStyles.primaryText} numberOfLines={1}>
        {primary}
      </Text>
      {secondary ? (
        <Text style={rowStyles.secondaryText} numberOfLines={1}>
          {secondary}
        </Text>
      ) : null}
      <View style={rowStyles.iconContainer}>
      <LocationSvg width={20} height={20} fill={'black'} />
      </View>
  
    </View>
  );
}

const AddressAutocompleteInput = memo(function AddressAutocompleteInput({
  value,
  onChange,
  onBlur,
  placeholder,
  startIcon,
  name,
  hasError,
  styles,
  colors,
}) {
  const autocompleteStyles = useMemo(() => createAutocompleteStyles(colors), [colors]);
  const rowStyles = useMemo(() => createRowStyles(colors), [colors]);
  const [isFocused, setIsFocused] = useState(false);
  const placesRef = useRef(null);
  const syncedValueRef = useRef(value ?? '');
  const localizationRequestRef = useRef(0);

  useEffect(() => {
    const nextValue = value ?? '';
    if (nextValue !== syncedValueRef.current) {
      placesRef.current?.setAddressText(nextValue);
      syncedValueRef.current = nextValue;
    }
  }, [value]);

  const handlePress = useCallback(
    (data, details = null) => {
      const address = buildDetailedAddress(data, details);
      syncedValueRef.current = address;
      // The library has already put the raw (often English) suggestion
      // description into the input by now, so explicitly overwrite it
      // with our detailed address.
      placesRef.current?.setAddressText(address);
      onChange(address);

      // If Google returned the address (partly) in English, re-resolve
      // it in Armenian and swap the value once the localized version
      // arrives.
      if (!LATIN_SCRIPT_REGEX.test(address)) {
        return;
      }

      const requestId = ++localizationRequestRef.current;
      fetchArmenianAddress({
        placeId: details?.place_id ?? data?.place_id,
        location: details?.geometry?.location,
      }).then((localized) => {
        const isStale =
          !localized ||
          requestId !== localizationRequestRef.current ||
          // The user typed or selected something else meanwhile.
          syncedValueRef.current !== address;
        if (isStale) {
          return;
        }

        // Keep the place name (e.g. a POI selected from the list) in
        // front of the geocoded address, but only when Google gave us
        // an Armenian name for it.
        const placeName = details?.name;
        const armenianAddress =
          placeName &&
          ARMENIAN_SCRIPT_REGEX.test(placeName) &&
          !localized.includes(placeName)
            ? `${placeName}, ${localized}`
            : localized;

        syncedValueRef.current = armenianAddress;
        placesRef.current?.setAddressText(armenianAddress);
        onChange(armenianAddress);
      });
    },
    [onChange],
  );

  const handleFail = useCallback(
    (message) => {
      console.warn(`[FormAddressField:${name}]`, message);
    },
    [name],
  );

  const textInputProps = useMemo(
    () => ({
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
    }),
    [onChange, onBlur, colors.textDisabled],
  );

  const renderRow = useCallback(
    (data) => renderSuggestionRow(data, rowStyles),
    [rowStyles],
  );

  const renderLeftButton = useCallback(
    () => (startIcon ? <View style={styles.inputIcon}>{startIcon}</View> : null),
    [startIcon, styles.inputIcon],
  );

  return (
    <View style={[styles.field, isFocused && styles.fieldFocused]}>
      <View style={[styles.autocompleteWrapper, hasError && styles.inputError]}>
        <GooglePlacesAutocomplete
          ref={placesRef}
          placeholder={placeholder}
          minLength={MIN_QUERY_LENGTH}
          debounce={300}
          enablePoweredByContainer={false}
          fetchDetails={true}
          GooglePlacesDetailsQuery={PLACES_DETAILS_QUERY}
          keepResultsAfterBlur
          listViewDisplayed="auto"
          keyboardShouldPersistTaps="always"
          disableScroll
          query={PLACES_QUERY}
          onPress={handlePress}
          onFail={handleFail}
          textInputProps={textInputProps}
          renderRow={renderRow}
          renderLeftButton={renderLeftButton}
          styles={autocompleteStyles}
        />
      </View>
    </View>
  );
});

export function FormAddressField({
  control,
  name,
  label,
  placeholder,
  rules,
  startIcon,
  labelVariant = 'h6',
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const renderField = useCallback(
    ({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
      <View style={styles.container}>
        {label ? <Typography variant={labelVariant}>{label}</Typography> : null}
        <AddressAutocompleteInput
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          startIcon={startIcon}
          name={name}
          hasError={Boolean(error)}
          styles={styles}
          colors={colors}
        />
        {error?.message ? <Text style={styles.errorText}>{error.message}</Text> : null}
      </View>
    ),
    [styles, colors, label, labelVariant, placeholder, startIcon, name],
  );

  return <Controller control={control} name={name} rules={rules} render={renderField} />;
}
