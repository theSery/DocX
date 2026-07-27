import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import LocationSvg from '../icons/LocationSvg';
import { useEnsureInputVisible } from './formKeyboard';
import {
  ARMENIAN_ADDRESS_RULES,
  hasNonArmenianLetters,
} from '../../utils/patterns';

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
  // language: 'hy',
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
  // language: 'hy',
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
const UNIT_TOKEN_REGEX = /\d+[^\s,]*-(?:Շ|Բ|Տ)/g;
const BUILDING_NUMBER_SEGMENT_REGEX = /^\d\S*$/u;
const SIMPLE_INTEGER_REGEX = /^\d+$/;
const POSTAL_CODE_SEGMENT_REGEX = /^\d{4,}$/;

function getAddressComponent(components, type) {
  return components?.find((component) => component.types?.includes(type))?.long_name ?? '';
}

function isPostalCodeSegment(part) {
  return POSTAL_CODE_SEGMENT_REGEX.test(String(part || '').trim());
}

function isCountrySegment(part) {
  const trimmed = String(part || '').trim();
  if (!trimmed) {
    return false;
  }

  const lower = trimmed.toLowerCase();
  return (
    trimmed === 'Հայաստան' ||
    lower === 'armenia' ||
    lower === 'republic of armenia'
  );
}

/**
 * Drop trailing pure-numeric tokens after the city
 * ("Երևան 0028", "Երևան, 28", "2-Տ Երևան 0028").
 */
function stripTrailingNumericTokens(text) {
  let result = String(text || '').trim();
  let next = result.replace(/(?:[\s,]+)\d+\s*$/g, '').trim();

  while (next !== result) {
    result = next;
    next = result.replace(/(?:[\s,]+)\d+\s*$/g, '').trim();
  }

  return result;
}

function cleanCitySegment(cityPart) {
  const tokens = String(cityPart || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  while (tokens.length && SIMPLE_INTEGER_REGEX.test(tokens[tokens.length - 1])) {
    tokens.pop();
  }

  return tokens.join(' ').trim();
}

/**
 * Pull a leading simple integer ("2 Կիևյան…") into buildingNumber.
 * Leave complex tokens alone: "1/2 …", "2 line …".
 */
function extractLeadingBuildingNumber(street) {
  const trimmed = String(street || '').trim();
  if (!trimmed) {
    return { buildingNumber: '', street: '' };
  }

  const tokens = trimmed.split(/\s+/);
  if (tokens.length < 2) {
    return { buildingNumber: '', street: trimmed };
  }

  const [first, second, ...rest] = tokens;
  if (!SIMPLE_INTEGER_REGEX.test(first)) {
    return { buildingNumber: '', street: trimmed };
  }

  // "2 line …" — number followed by a Latin word, keep intact.
  if (LATIN_SCRIPT_REGEX.test(second)) {
    return { buildingNumber: '', street: trimmed };
  }

  return {
    buildingNumber: first,
    street: [second, ...rest].join(' ').trim(),
  };
}

/**
 * Normalize a Google/Places address for the confirm modal:
 * - drop postal codes (0028) and country (Հայաստան)
 * - drop leftover numbers after the city name
 * - keep street + city
 * - move a simple leading building number into buildingNumber
 */
function normalizeSelectedAddress(address) {
  const parts = String(address || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !isPostalCodeSegment(part) && !isCountrySegment(part));

  if (!parts.length) {
    return { address: '', buildingNumber: '' };
  }

  if (parts.length === 1) {
    const extracted = extractLeadingBuildingNumber(
      stripTrailingNumericTokens(parts[0]),
    );
    return {
      address: extracted.street,
      buildingNumber: extracted.buildingNumber,
    };
  }

  // Drop trailing standalone numeric segments after the city ("…, Երևան, 0028").
  while (parts.length > 1 && SIMPLE_INTEGER_REGEX.test(parts[parts.length - 1])) {
    parts.pop();
  }

  if (!parts.length) {
    return { address: '', buildingNumber: '' };
  }

  if (parts.length === 1) {
    const extracted = extractLeadingBuildingNumber(
      stripTrailingNumericTokens(parts[0]),
    );
    return {
      address: extracted.street,
      buildingNumber: extracted.buildingNumber,
    };
  }

  const city = cleanCitySegment(parts[parts.length - 1]);
  const streetSegments = parts.slice(0, -1);

  let buildingFromSegment = '';
  const remainingStreetSegments = [];

  streetSegments.forEach((segment) => {
    if (!buildingFromSegment && SIMPLE_INTEGER_REGEX.test(segment)) {
      buildingFromSegment = segment;
      return;
    }
    remainingStreetSegments.push(segment);
  });

  const streetJoined = remainingStreetSegments.join(', ');
  const extracted = extractLeadingBuildingNumber(streetJoined);
  const buildingNumber = buildingFromSegment || extracted.buildingNumber;
  const street = buildingFromSegment ? streetJoined : extracted.street;

  const normalizedAddress = stripTrailingNumericTokens(
    street ? `${street}, ${city}` : city,
  );

  return {
    address: normalizedAddress,
    buildingNumber,
  };
}

/**
 * Split a formatted address into the street (first comma segment) and the
 * remaining locality parts, dropping a leading bare building-number segment
 * so unit fields can replace it.
 */
function splitAddressParts(address) {
  const parts = String(address || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return { street: '', rest: [] };
  }

  const [street, ...tail] = parts;
  const rest = [...tail];

  // Drop a leading bare house/building number so unit fields can replace it.
  while (rest.length && BUILDING_NUMBER_SEGMENT_REGEX.test(rest[0])) {
    rest.shift();
  }

  return { street, rest };
}

function composeAddressWithUnits(baseAddress, { building, apartment, house }) {
  const trimmedBuilding = String(building || '').trim();
  const trimmedApartment = String(apartment || '').trim();
  const trimmedHouse = String(house || '').trim();
  const { street, rest } = splitAddressParts(baseAddress);
  const restText = stripTrailingNumericTokens(
    rest.map(cleanCitySegment).filter(Boolean).join(', '),
  );

  if (!street) {
    return stripTrailingNumericTokens(String(baseAddress || '').trim());
  }

  let unitPart = '';
  if (trimmedHouse) {
    unitPart = `${trimmedHouse}-Տ`;
  } else if (trimmedBuilding && trimmedApartment) {
    // Inject markers only when both building and apartment are present.
    unitPart = `${trimmedBuilding}-Շ ${trimmedApartment}-Բ`;
  }

  if (!unitPart) {
    return stripTrailingNumericTokens(String(baseAddress || '').trim());
  }

  // "Ավանեսովի նրբ, 5-Շ 12-Բ Երևան" / "Ավանեսովի նրբ, 10-Տ Երևան"
  if (restText) {
    return stripTrailingNumericTokens(`${street}, ${unitPart} ${restText}`);
  }

  return stripTrailingNumericTokens(`${street}, ${unitPart}`);
}

function stripInjectedUnits(address) {
  return stripTrailingNumericTokens(
    String(address || '')
      .replace(UNIT_TOKEN_REGEX, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/,\s*,/g, ',')
      .replace(/\s+,/g, ',')
      .replace(/,\s+/g, ', ')
      .replace(/^,\s*/, '')
      .replace(/,\s*$/, '')
      .trim(),
  );
}

function getArmenianAddressValidationError(address) {
  const trimmed = String(address || '').trim();

  if (!trimmed) {
    return ARMENIAN_ADDRESS_RULES.required;
  }

  // Block letters from other languages only. Numbers, unit markers
  // (10-Շ, 22-Բ), slashes (1/2), and other symbols are allowed.
  if (hasNonArmenianLetters(trimmed)) {
    return ARMENIAN_ADDRESS_RULES.pattern.message;
  }

  return null;
}

/**
 * Building + apartment become required together once either is filled.
 * House mode is independent — building/apartment may stay empty.
 */
function getUnitFieldsValidationErrors({ building, apartment, house }) {
  if (String(house || '').trim()) {
    return { building: null, apartment: null };
  }

  const hasBuilding = Boolean(String(building || '').trim());
  const hasApartment = Boolean(String(apartment || '').trim());

  if (!hasBuilding && !hasApartment) {
    return { building: null, apartment: null };
  }

  return {
    building: hasBuilding ? null : 'Շենքը պարտադիր է',
    apartment: hasApartment ? null : 'Բնակարանը պարտադիր է',
  };
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
    confirmKeyboardView: {
      flex: 1,
    },
    confirmBackdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    confirmSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 32,
      gap: 16,
      minHeight: '55%',
    },
    confirmTitle: {
      fontSize: 17,
      fontFamily: FONT_FAMILY.medium,
      color: colors.text,
      textAlign: 'center',
    },
    unitFieldsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    unitField: {
      flex: 1,
      gap: 6,
    },
    unitFieldLabel: {
      fontSize: 13,
      fontFamily: FONT_FAMILY.medium,
      color: colors.textSecondary,
    },
    unitInputRow: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: INPUT_RADIUS,
      backgroundColor: colors.input,
      paddingHorizontal: 12,
      height: 45,
      justifyContent: 'center',
    },
    unitInputRowError: {
      borderColor: colors.error,
    },
    unitFieldError: {
      fontSize: 11,
      fontFamily: FONT_FAMILY.regular,
      color: colors.error,
    },
    unitInput: {
      margin: 0,
      padding: 0,
      fontSize: 15,
      fontFamily: FONT_FAMILY.regular,
      color: colors.text,
    },
    confirmInputRow: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: INPUT_RADIUS,
      backgroundColor: colors.input,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 45,
    },
    confirmInputRowError: {
      borderColor: colors.error,
    },
    confirmInput: {
      margin: 0,
      padding: 0,
      fontSize: 15,
      fontFamily: FONT_FAMILY.regular,
      color: colors.text,
      maxHeight: 120,
    },
    confirmValidationError: {
      fontSize: 12,
      fontFamily: FONT_FAMILY.regular,
      color: colors.error,
      marginTop: -8,
    },
    confirmActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 'auto',
    },
    confirmActionButton: {
      flex: 1,
      height: 45,
      borderRadius: 10,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    confirmCancelButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    confirmCancelText: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.regular,
      color: colors.textSecondary,
    },
    confirmSubmitButton: {
      backgroundColor: colors.primary,
    },
    confirmSubmitButtonDisabled: {
      opacity: 0.5,
    },
    confirmSubmitText: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.regular,
      color: colors.buttonTextOnPrimary,
    },
    loaderRow: {
      paddingVertical: 4,
      alignItems: 'center',
      justifyContent: 'center',
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
      shadowColor: colors.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -4 },
    },
    row: {
      backgroundColor: colors.input,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 52,
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
    rowContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      width: '100%',
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: colors.borderSubtle,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textBlock: {
      flex: 1,
      minWidth: 0,
    },
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
  });

function renderSuggestionRow(data, rowStyles, colors) {
  const primary = data?.structured_formatting?.main_text ?? data?.description ?? '';
  const secondary = data?.structured_formatting?.secondary_text ?? '';

  return (
    <View style={rowStyles.rowContent}>
      <View style={rowStyles.iconBox}>
        <LocationSvg width={18} height={18} fill={colors.icons} />
      </View>
      <View style={rowStyles.textBlock}>
        <Text style={rowStyles.primaryText} numberOfLines={1}>
          {primary}
        </Text>
        {secondary ? (
          <Text style={rowStyles.secondaryText} numberOfLines={1}>
            {secondary}
          </Text>
        ) : null}
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
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmDraft, setConfirmDraft] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [isLocalizing, setIsLocalizing] = useState(false);
  const [autocompleteKey, setAutocompleteKey] = useState(0);
  const placesRef = useRef(null);
  const inputContainerRef = useRef(null);
  // Start unset so the first effect always pushes the form value into
  // GooglePlacesAutocomplete (needed when this field mounts after reset,
  // e.g. notificationAddress shown only once addresses differ).
  const syncedValueRef = useRef(undefined);
  const pendingAddressTextRef = useRef(null);
  const localizationRequestRef = useRef(0);
  const confirmDraftRef = useRef('');
  const baseAddressRef = useRef('');
  const initialNormalizedAddressRef = useRef('');
  const initialBuildingRef = useRef('');
  const unitFieldsRef = useRef({ building: '', apartment: '', house: '' });
  const { onInputFocus, onInputBlur } = useEnsureInputVisible(inputContainerRef);

  useEffect(() => {
    const nextValue = value ?? '';
    if (nextValue !== syncedValueRef.current) {
      placesRef.current?.setAddressText(nextValue);
      syncedValueRef.current = nextValue;
    }
  }, [value]);

  useEffect(() => {
    if (pendingAddressTextRef.current == null) {
      return;
    }

    const nextText = pendingAddressTextRef.current;
    pendingAddressTextRef.current = null;
    placesRef.current?.setAddressText(nextText);
    placesRef.current?.blur();
  }, [autocompleteKey]);

  const hideSuggestionList = useCallback((addressText) => {
    const nextText =
      typeof addressText === 'string' ? addressText : syncedValueRef.current;
    pendingAddressTextRef.current = nextText;
    placesRef.current?.blur();
    setAutocompleteKey((key) => key + 1);
  }, []);

  const applyComposedDraft = useCallback((baseAddress, units) => {
    const nextUnits = units ?? unitFieldsRef.current;
    const composed = composeAddressWithUnits(baseAddress, nextUnits);
    confirmDraftRef.current = composed;
    setConfirmDraft(composed);
  }, []);

  const closeConfirmModal = useCallback(() => {
    localizationRequestRef.current += 1;
    setConfirmVisible(false);
    setConfirmDraft('');
    confirmDraftRef.current = '';
    baseAddressRef.current = '';
    initialNormalizedAddressRef.current = '';
    initialBuildingRef.current = '';
    unitFieldsRef.current = { building: '', apartment: '', house: '' };
    setBuildingNumber('');
    setApartmentNumber('');
    setHouseNumber('');
    setIsLocalizing(false);
  }, []);

  const handleConfirmAddress = useCallback(() => {
    const nextAddress = confirmDraft.trim();
    const validationError = getArmenianAddressValidationError(nextAddress);
    const unitErrors = getUnitFieldsValidationErrors(unitFieldsRef.current);
    if (validationError || unitErrors.building || unitErrors.apartment) {
      return;
    }

    syncedValueRef.current = nextAddress;
    onChange(nextAddress);
    closeConfirmModal();
    hideSuggestionList(nextAddress);
  }, [closeConfirmModal, confirmDraft, hideSuggestionList, onChange]);

  const handleConfirmDraftChange = useCallback((text) => {
    confirmDraftRef.current = text;
    setConfirmDraft(text);
    baseAddressRef.current = stripInjectedUnits(text);
  }, []);

  const confirmDraftError = useMemo(
    () => getArmenianAddressValidationError(confirmDraft),
    [confirmDraft],
  );

  const unitFieldErrors = useMemo(
    () =>
      getUnitFieldsValidationErrors({
        building: buildingNumber,
        apartment: apartmentNumber,
        house: houseNumber,
      }),
    [apartmentNumber, buildingNumber, houseNumber],
  );

  const handleBuildingChange = useCallback(
    (text) => {
      unitFieldsRef.current = {
        building: text,
        apartment: unitFieldsRef.current.apartment,
        house: '',
      };
      setBuildingNumber(text);
      setHouseNumber('');
      applyComposedDraft(baseAddressRef.current, unitFieldsRef.current);
    },
    [applyComposedDraft],
  );

  const handleApartmentChange = useCallback(
    (text) => {
      unitFieldsRef.current = {
        building: unitFieldsRef.current.building,
        apartment: text,
        house: '',
      };
      setApartmentNumber(text);
      setHouseNumber('');
      applyComposedDraft(baseAddressRef.current, unitFieldsRef.current);
    },
    [applyComposedDraft],
  );

  const handleHouseChange = useCallback(
    (text) => {
      unitFieldsRef.current = {
        building: '',
        apartment: '',
        house: text,
      };
      setHouseNumber(text);
      setBuildingNumber('');
      setApartmentNumber('');
      applyComposedDraft(baseAddressRef.current, unitFieldsRef.current);
    },
    [applyComposedDraft],
  );

  const openConfirmModal = useCallback(
    (address) => {
      const normalized = normalizeSelectedAddress(address);

      baseAddressRef.current = normalized.address;
      initialNormalizedAddressRef.current = normalized.address;
      initialBuildingRef.current = normalized.buildingNumber;
      unitFieldsRef.current = {
        building: normalized.buildingNumber,
        apartment: '',
        house: '',
      };
      setBuildingNumber(normalized.buildingNumber);
      setApartmentNumber('');
      setHouseNumber('');
      applyComposedDraft(normalized.address, unitFieldsRef.current);
      setConfirmVisible(true);
    },
    [applyComposedDraft],
  );

  const handlePress = useCallback(
    (data, details = null) => {
      const address = buildDetailedAddress(data, details);
      const normalized = normalizeSelectedAddress(address);

      // The library auto-fills the input on press — restore the previous
      // value until the user confirms in the modal.
      placesRef.current?.setAddressText(syncedValueRef.current);
      placesRef.current?.blur();

      openConfirmModal(address);

      if (!LATIN_SCRIPT_REGEX.test(address) && !LATIN_SCRIPT_REGEX.test(normalized.address)) {
        return;
      }

      const requestId = ++localizationRequestRef.current;
      setIsLocalizing(true);

      fetchArmenianAddress({
        placeId: details?.place_id ?? data?.place_id,
        location: details?.geometry?.location,
      })
        .then((localized) => {
          const isStale =
            !localized ||
            requestId !== localizationRequestRef.current ||
            // User already edited the base address in the modal.
            baseAddressRef.current !== initialNormalizedAddressRef.current;
          if (isStale) {
            return;
          }

          const placeName = details?.name;
          const armenianAddress =
            placeName &&
            ARMENIAN_SCRIPT_REGEX.test(placeName) &&
            !localized.includes(placeName)
              ? `${placeName}, ${localized}`
              : localized;

          const normalizedLocalized = normalizeSelectedAddress(armenianAddress);
          baseAddressRef.current = normalizedLocalized.address;
          initialNormalizedAddressRef.current = normalizedLocalized.address;

          const unitsUnchanged =
            unitFieldsRef.current.building === initialBuildingRef.current &&
            !unitFieldsRef.current.apartment &&
            !unitFieldsRef.current.house;

          if (unitsUnchanged) {
            initialBuildingRef.current = normalizedLocalized.buildingNumber;
            unitFieldsRef.current = {
              building: normalizedLocalized.buildingNumber,
              apartment: '',
              house: '',
            };
            setBuildingNumber(normalizedLocalized.buildingNumber);
            setApartmentNumber('');
            setHouseNumber('');
          }

          applyComposedDraft(normalizedLocalized.address, unitFieldsRef.current);
        })
        .finally(() => {
          if (requestId === localizationRequestRef.current) {
            setIsLocalizing(false);
          }
        });
    },
    [applyComposedDraft, openConfirmModal],
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
      onFocus: () => {
        setIsFocused(true);
        onInputFocus();
      },
      onBlur: () => {
        setIsFocused(false);
        onInputBlur();
        onBlur();
      },
      placeholderTextColor: colors.textDisabled,
      autoCorrect: false,
    }),
    [onChange, onBlur, onInputFocus, onInputBlur, colors.textDisabled],
  );

  const renderRow = useCallback(
    (data) => renderSuggestionRow(data, rowStyles, colors),
    [rowStyles, colors],
  );

  const renderLeftButton = useCallback(
    () => (startIcon ? <View style={styles.inputIcon}>{startIcon}</View> : null),
    [startIcon, styles.inputIcon],
  );

  const canConfirmAddress =
    !confirmDraftError && !unitFieldErrors.building && !unitFieldErrors.apartment;

  return (
    <View
      ref={inputContainerRef}
      collapsable={false}
      style={[styles.field, isFocused && styles.fieldFocused]}
    >
      <View style={[styles.autocompleteWrapper, hasError && styles.inputError]}>
        <GooglePlacesAutocomplete
          key={autocompleteKey}
          ref={placesRef}
          placeholder={placeholder}
          minLength={MIN_QUERY_LENGTH}
          debounce={300}
          enablePoweredByContainer={false}
          fetchDetails={true}
          GooglePlacesDetailsQuery={PLACES_DETAILS_QUERY}
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

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={closeConfirmModal}
      >
        <KeyboardAvoidingView
          style={styles.confirmKeyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.confirmBackdrop} onPress={closeConfirmModal}>
            <Pressable style={styles.confirmSheet} onPress={() => {}}>
              <Text style={styles.confirmTitle}>Հաստատել հասցեն</Text>


              <View
                style={[
                  styles.confirmInputRow,
                  confirmDraftError && styles.confirmInputRowError,
                ]}
              >
                <TextInput
                  value={confirmDraft}
                  onChangeText={handleConfirmDraftChange}
                  placeholder={placeholder}
                  placeholderTextColor={colors.textDisabled}
                  autoCorrect={false}
                  multiline
                  style={styles.confirmInput}
                />
              </View>
              {confirmDraftError ? (
                <Text style={styles.confirmValidationError}>{confirmDraftError}</Text>
              ) : null}


              <View style={styles.unitFieldsRow}>
                <View style={styles.unitField}>
                  <Text style={styles.unitFieldLabel}>Շենք</Text>
                  <View
                    style={[
                      styles.unitInputRow,
                      unitFieldErrors.building && styles.unitInputRowError,
                    ]}
                  >
                    <TextInput
                      value={buildingNumber}
                      onChangeText={handleBuildingChange}
                      placeholder="00"
                      placeholderTextColor={colors.textDisabled}
                      autoCorrect={false}
                      style={styles.unitInput}
                    />
                  </View>
                  {unitFieldErrors.building ? (
                    <Text style={styles.unitFieldError}>{unitFieldErrors.building}</Text>
                  ) : null}
                </View>

                <View style={styles.unitField}>
                  <Text style={styles.unitFieldLabel}>Բնակարան</Text>
                  <View
                    style={[
                      styles.unitInputRow,
                      unitFieldErrors.apartment && styles.unitInputRowError,
                    ]}
                  >
                    <TextInput
                      value={apartmentNumber}
                      onChangeText={handleApartmentChange}
                      placeholder="00"
                      placeholderTextColor={colors.textDisabled}
                      autoCorrect={false}
                      style={styles.unitInput}
                    />
                  </View>
                  {unitFieldErrors.apartment ? (
                    <Text style={styles.unitFieldError}>{unitFieldErrors.apartment}</Text>
                  ) : null}
                </View>

                <View style={styles.unitField}>
                  <Text style={styles.unitFieldLabel}>Տուն</Text>
                  <View style={styles.unitInputRow}>
                    <TextInput
                      value={houseNumber}
                      onChangeText={handleHouseChange}
                      placeholder="00"
                      placeholderTextColor={colors.textDisabled}
                      autoCorrect={false}
                      style={styles.unitInput}
                    />
                  </View>
                </View>
              </View>

 

              {isLocalizing ? (
                <View style={styles.loaderRow}>
                  <ActivityIndicator color={colors.icons} />
                </View>
              ) : null}

              <View style={styles.confirmActions}>
                <Pressable
                  onPress={closeConfirmModal}
                  style={[styles.confirmActionButton, styles.confirmCancelButton]}
                  accessibilityRole="button"
                  accessibilityLabel="Չեղարկել"
                >
                  <Text style={styles.confirmCancelText}>Չեղարկել</Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirmAddress}
                  disabled={!canConfirmAddress}
                  style={[
                    styles.confirmActionButton,
                    styles.confirmSubmitButton,
                    !canConfirmAddress && styles.confirmSubmitButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Հաստատել"
                >
                  <Text style={styles.confirmSubmitText}>Հաստատել</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
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
