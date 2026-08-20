import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Typography } from '../typography';
import { FONT_FAMILY } from '../../theme';
import { useTheme, useThemedStyles } from '../../hooks';
import { ENV } from '../../config/env';
import LocationSvg from '../icons/LocationSvg';
import CloseIcon from '../icons/CloseIcon';
import { useEnsureInputVisible } from './formKeyboard';
import {
  ARMENIAN_ADDRESS_RULES,
  hasNonArmenianLetters,
} from '../../utils/patterns';

const INPUT_RADIUS = 16;
const MIN_QUERY_LENGTH = 2;
const SUGGESTIONS_DEBOUNCE_MS = 300;
const SUGGESTIONS_MAX_HEIGHT = 220;
const SUGGESTIONS_MIN_HEIGHT = 80;
const SUGGESTIONS_GAP = 4;
/** Keep the suggestions panel above sibling form fields / checkboxes. */
const SUGGESTIONS_Z_INDEX = 9999;
const PLACES_AUTOCOMPLETE_URL =
  'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const PLACES_DETAILS_URL =
  'https://maps.googleapis.com/maps/api/place/details/json';

/**
 * Prefer opening below the input; flip above when there isn't enough room
 * under the field (keyboard / screen bottom), comparing remaining space.
 */
function resolveSuggestionsLayout({ y, height, windowHeight, keyboardTop }) {
  const visibleBottom =
    typeof keyboardTop === 'number' ? keyboardTop : windowHeight;
  const spaceBelow = Math.max(0, visibleBottom - (y + height) - SUGGESTIONS_GAP);
  const spaceAbove = Math.max(0, y - SUGGESTIONS_GAP);
  const openBelow =
    spaceBelow >= SUGGESTIONS_MAX_HEIGHT || spaceBelow >= spaceAbove;
  const available = openBelow ? spaceBelow : spaceAbove;

  return {
    placement: openBelow ? 'below' : 'above',
    maxHeight: Math.max(
      SUGGESTIONS_MIN_HEIGHT,
      Math.min(
        SUGGESTIONS_MAX_HEIGHT,
        available > 0 ? available : SUGGESTIONS_MAX_HEIGHT,
      ),
    ),
  };
}

const PLACES_AUTOCOMPLETE_PARAMS = {
  key: ENV.GOOGLE_PLACES_API_KEY,
  components: 'country:am',
  region: 'am',
  // Bias toward Yerevan without hard-restricting results.
  location: '40.1772,44.5133',
  radius: '20000',
};

const PLACES_DETAILS_PARAMS = {
  key: ENV.GOOGLE_PLACES_API_KEY,
  fields: 'address_component,formatted_address,geometry,name',
  region: 'am',
};

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

function toQueryString(params) {
  return Object.entries(params)
    .filter(([, value]) => value != null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
}

async function fetchPlacePredictions(input) {
  const query = toQueryString({
    ...PLACES_AUTOCOMPLETE_PARAMS,
    input,
  });
  const response = await fetch(`${PLACES_AUTOCOMPLETE_URL}?${query}`);
  const json = await response.json();

  if (json?.status === 'ZERO_RESULTS') {
    return [];
  }

  if (json?.status !== 'OK' || !Array.isArray(json.predictions)) {
    const message = json?.error_message || json?.status || 'Places autocomplete failed';
    throw new Error(message);
  }

  return json.predictions;
}

async function fetchPlaceDetails(placeId) {
  const query = toQueryString({
    ...PLACES_DETAILS_PARAMS,
    place_id: placeId,
  });
  const response = await fetch(`${PLACES_DETAILS_URL}?${query}`);
  const json = await response.json();

  if (json?.status !== 'OK' || !json.result) {
    const message = json?.error_message || json?.status || 'Place details failed';
    throw new Error(message);
  }

  return json.result;
}

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
      zIndex: 1,
      overflow: 'visible',
    },
    containerFocused: {
      zIndex: SUGGESTIONS_Z_INDEX,
      elevation: SUGGESTIONS_Z_INDEX,
    },
    field: {
      gap: 8,
      zIndex: 1,
      overflow: 'visible',
    },
    fieldFocused: {
      zIndex: SUGGESTIONS_Z_INDEX,
      elevation: SUGGESTIONS_Z_INDEX,
    },
    autocompleteWrapper: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: INPUT_RADIUS,
      backgroundColor: colors.input,
      overflow: 'visible',
      zIndex: SUGGESTIONS_Z_INDEX,
      elevation: SUGGESTIONS_Z_INDEX,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 45,
      paddingHorizontal: 16,
      gap: 10,
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
    inputError: {
      borderColor: colors.error,
    },
    inputIcon: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    clearButton: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 3,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 100,
    },
    suggestionSeparator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    suggestionRow: {
      backgroundColor: colors.input,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 52,
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

function createSuggestionsListStyle(
  colors,
  { placement = 'below', maxHeight = SUGGESTIONS_MAX_HEIGHT } = {},
) {
  const opensAbove = placement === 'above';

  return {
    position: 'absolute',
    left: 0,
    right: 0,
    ...(opensAbove
      ? {
          bottom: '100%',
          marginBottom: SUGGESTIONS_GAP,
          shadowOffset: { width: 0, height: -4 },
        }
      : {
          top: '100%',
          marginTop: SUGGESTIONS_GAP,
          shadowOffset: { width: 0, height: 4 },
        }),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    maxHeight,
    marginHorizontal: 0,
    borderRadius: INPUT_RADIUS,
    overflow: 'hidden',
    zIndex: SUGGESTIONS_Z_INDEX,
    elevation: SUGGESTIONS_Z_INDEX,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
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
  onFocusChange,
  placeholder,
  startIcon,
  name,
  hasError,
  styles,
  colors,
}) {
  const [suggestionsLayout, setSuggestionsLayout] = useState({
    placement: 'below',
    maxHeight: SUGGESTIONS_MAX_HEIGHT,
  });
  const suggestionsListStyle = useMemo(
    () => createSuggestionsListStyle(colors, suggestionsLayout),
    [colors, suggestionsLayout],
  );
  const rowStyles = useMemo(() => createRowStyles(colors), [colors]);
  const [inputText, setInputText] = useState(value ?? '');
  const [predictions, setPredictions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmDraft, setConfirmDraft] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [isLocalizing, setIsLocalizing] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const inputRef = useRef(null);
  const inputContainerRef = useRef(null);
  const keyboardTopRef = useRef(null);
  const layoutTimeoutsRef = useRef([]);
  const blurTimeoutRef = useRef(null);
  const predictionRequestRef = useRef(0);
  const syncedValueRef = useRef(value ?? '');
  const localizationRequestRef = useRef(0);
  const confirmDraftRef = useRef('');
  const baseAddressRef = useRef('');
  const initialNormalizedAddressRef = useRef('');
  const initialBuildingRef = useRef('');
  const unitFieldsRef = useRef({ building: '', apartment: '', house: '' });
  const { onInputFocus, onInputBlur } = useEnsureInputVisible(inputContainerRef);

  const clearLayoutTimeouts = useCallback(() => {
    layoutTimeoutsRef.current.forEach(clearTimeout);
    layoutTimeoutsRef.current = [];
  }, []);

  const clearBlurTimeout = useCallback(() => {
    if (blurTimeoutRef.current != null) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }, []);

  const updateSuggestionsLayout = useCallback(() => {
    const node = inputContainerRef.current;
    if (!node || typeof node.measureInWindow !== 'function') {
      return;
    }

    node.measureInWindow((_x, y, _width, height) => {
      if (y == null || height == null) {
        return;
      }

      const next = resolveSuggestionsLayout({
        y,
        height,
        windowHeight: Dimensions.get('window').height,
        keyboardTop: keyboardTopRef.current,
      });

      setSuggestionsLayout((prev) =>
        prev.placement === next.placement && prev.maxHeight === next.maxHeight
          ? prev
          : next,
      );
    });
  }, []);

  const scheduleSuggestionsLayoutUpdate = useCallback(() => {
    clearLayoutTimeouts();
    requestAnimationFrame(updateSuggestionsLayout);
    [120, 280].forEach((delayMs) => {
      const timeoutId = setTimeout(updateSuggestionsLayout, delayMs);
      layoutTimeoutsRef.current.push(timeoutId);
    });
  }, [clearLayoutTimeouts, updateSuggestionsLayout]);

  useEffect(() => {
    const handleKeyboardShow = (event) => {
      keyboardTopRef.current = event?.endCoordinates?.screenY ?? null;
      updateSuggestionsLayout();
    };
    const handleKeyboardHide = () => {
      keyboardTopRef.current = null;
      updateSuggestionsLayout();
    };

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
      clearLayoutTimeouts();
      clearBlurTimeout();
    };
  }, [clearBlurTimeout, clearLayoutTimeouts, updateSuggestionsLayout]);

  useEffect(() => {
    const nextValue = value ?? '';
    if (nextValue !== syncedValueRef.current) {
      syncedValueRef.current = nextValue;
      setInputText(nextValue);
    }
  }, [value]);

  useEffect(() => {
    if (!isFocused) {
      setPredictions([]);
      return undefined;
    }

    const query = inputText.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      setPredictions([]);
      return undefined;
    }

    const requestId = ++predictionRequestRef.current;
    const timeoutId = setTimeout(() => {
      fetchPlacePredictions(query)
        .then((nextPredictions) => {
          if (requestId !== predictionRequestRef.current) {
            return;
          }
          setPredictions(nextPredictions);
          scheduleSuggestionsLayoutUpdate();
        })
        .catch((error) => {
          if (requestId !== predictionRequestRef.current) {
            return;
          }
          setPredictions([]);
          console.warn(`[FormAddressField:${name}]`, error?.message || error);
        });
    }, SUGGESTIONS_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [inputText, isFocused, name, scheduleSuggestionsLayoutUpdate]);

  const hideSuggestionList = useCallback((addressText) => {
    const nextText =
      typeof addressText === 'string' ? addressText : syncedValueRef.current;
    syncedValueRef.current = nextText ?? '';
    setInputText(nextText ?? '');
    setPredictions([]);
    inputRef.current?.blur();
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

  const handlePredictionPress = useCallback(
    async (prediction) => {
      clearBlurTimeout();
      setPredictions([]);
      setIsFocused(false);
      onFocusChange?.(false);
      inputRef.current?.blur();

      // Keep the current form value until the user confirms in the modal.
      setInputText(syncedValueRef.current ?? '');

      setIsFetchingDetails(true);
      let details = null;
      try {
        if (prediction?.place_id) {
          details = await fetchPlaceDetails(prediction.place_id);
        }
      } catch (error) {
        console.warn(`[FormAddressField:${name}]`, error?.message || error);
      } finally {
        setIsFetchingDetails(false);
      }

      const address = buildDetailedAddress(prediction, details);
      const normalized = normalizeSelectedAddress(address);
      openConfirmModal(address);

      if (!LATIN_SCRIPT_REGEX.test(address) && !LATIN_SCRIPT_REGEX.test(normalized.address)) {
        return;
      }

      const requestId = ++localizationRequestRef.current;
      setIsLocalizing(true);

      fetchArmenianAddress({
        placeId: details?.place_id ?? prediction?.place_id,
        location: details?.geometry?.location,
      })
        .then((localized) => {
          const isStale =
            !localized ||
            requestId !== localizationRequestRef.current ||
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
    [applyComposedDraft, clearBlurTimeout, name, onFocusChange, openConfirmModal],
  );

  const handleChangeText = useCallback(
    (text) => {
      syncedValueRef.current = text;
      setInputText(text);
      onChange(text);
    },
    [onChange],
  );

  const handleClearText = useCallback(() => {
    clearBlurTimeout();
    syncedValueRef.current = '';
    setInputText('');
    setPredictions([]);
    onChange('');
    inputRef.current?.focus();
  }, [clearBlurTimeout, onChange]);

  const handleFocus = useCallback(() => {
    clearBlurTimeout();
    setIsFocused(true);
    onFocusChange?.(true);
    onInputFocus();
    scheduleSuggestionsLayoutUpdate();
  }, [
    clearBlurTimeout,
    onFocusChange,
    onInputFocus,
    scheduleSuggestionsLayoutUpdate,
  ]);

  const handleBlur = useCallback(() => {
    clearBlurTimeout();
    // Delay so a suggestion press can register before the list unmounts.
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false);
      setPredictions([]);
      onFocusChange?.(false);
      clearLayoutTimeouts();
      onInputBlur();
      onBlur();
    }, 180);
  }, [
    clearBlurTimeout,
    clearLayoutTimeouts,
    onBlur,
    onFocusChange,
    onInputBlur,
  ]);

  const showSuggestions = isFocused && predictions.length > 0;
  const canConfirmAddress =
    !confirmDraftError && !unitFieldErrors.building && !unitFieldErrors.apartment;

  return (
    <View
      ref={inputContainerRef}
      collapsable={false}
      style={[styles.field, isFocused && styles.fieldFocused]}
    >
      <View style={[styles.autocompleteWrapper, hasError && styles.inputError]}>
        <View style={styles.inputRow}>
          {startIcon ? <View style={styles.inputIcon}>{startIcon}</View> : null}
          <TextInput
            ref={inputRef}
            value={inputText}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={colors.textDisabled}
            autoCorrect={false}
            style={styles.textInput}
          />
          {inputText ? (
            <Pressable
              onPress={handleClearText}
              hitSlop={8}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Մաքրել"
            >
              <CloseIcon width={15} height={15} fill={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        {showSuggestions ? (
          <ScrollView
            style={suggestionsListStyle}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {predictions.map((prediction, index) => (
              <View key={prediction.place_id || `${prediction.description}-${index}`}>
                {index > 0 ? <View style={styles.suggestionSeparator} /> : null}
                <Pressable
                  onPress={() => handlePredictionPress(prediction)}
                  style={styles.suggestionRow}
                  accessibilityRole="button"
                >
                  {renderSuggestionRow(prediction, rowStyles, colors)}
                </Pressable>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {isFetchingDetails ? (
        <View style={styles.loaderRow}>
          <ActivityIndicator color={colors.icons} />
        </View>
      ) : null}

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
  onFocusChange,
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocusChange = useCallback(
    (focused) => {
      setIsFocused(focused);
      onFocusChange?.(focused);
    },
    [onFocusChange],
  );

  const renderField = useCallback(
    ({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
      <View style={[styles.container, isFocused && styles.containerFocused]}>
        {label ? <Typography variant={labelVariant}>{label}</Typography> : null}
        <AddressAutocompleteInput
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocusChange={handleFocusChange}
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
    [
      styles,
      colors,
      label,
      labelVariant,
      placeholder,
      startIcon,
      name,
      isFocused,
      handleFocusChange,
    ],
  );

  return <Controller control={control} name={name} rules={rules} render={renderField} />;
}
