import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  ActivityIndicator,
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

const INPUT_RADIUS = 16;
const MIN_QUERY_LENGTH = 2;
const SUGGESTIONS_MAX_HEIGHT = 340;
const MIN_BUILDING_RESULTS = 10;
const MAX_SUGGESTIONS = 20;
const SEARCH_DEBOUNCE_MS = 320;
const EXPAND_BATCH_SIZE = 8;

// Fan-out building numbers so a street query like "Avanesov" can surface
// many concrete addresses (Google Autocomplete alone returns ≤5).
const BUILDING_NUMBER_CANDIDATES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  24, 25, 26, 28, 30, 32, 34, 36, 38, 40, 42, 45, 48, 50,
];

const AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

const YEREVAN_BIAS = {
  location: '40.1772,44.5133',
  radius: '25000',
};

const ARMENIAN_SCRIPT_REGEX = /[\u0530-\u058F]/;
const LATIN_SCRIPT_REGEX = /[A-Za-z]/;
// Last token is a building number only when it starts with a digit
// (e.g. "1", "10", "1/2", "12ա") — not when refining the street name.
const BUILDING_NUMBER_TOKEN_REGEX = /^(\d\S*)$/;

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

/**
 * Split "Avanesov 1" → { street: "Avanesov", numberPrefix: "1" }
 * so we can expand/filter building numbers that start with the typed prefix.
 */
function parseAddressQuery(input) {
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return { street: '', numberPrefix: null };
  }

  const parts = trimmed.split(' ');
  const last = parts[parts.length - 1];
  if (parts.length >= 2 && BUILDING_NUMBER_TOKEN_REGEX.test(last)) {
    const street = parts.slice(0, -1).join(' ').trim();
    if (street.length >= MIN_QUERY_LENGTH) {
      return { street, numberPrefix: last };
    }
  }

  return { street: trimmed, numberPrefix: null };
}

function predictionMainText(prediction) {
  return prediction?.structured_formatting?.main_text ?? prediction?.description ?? '';
}

function predictionHasBuildingNumber(prediction) {
  return /\d/.test(predictionMainText(prediction));
}

/** Best-effort building number token from a suggestion label. */
function extractBuildingNumberText(prediction) {
  const main = predictionMainText(prediction);
  const matches = main.match(/\d+[^\s,]*/g);
  return matches?.[matches.length - 1] ?? '';
}

function extractBuildingSortValue(prediction) {
  const match = extractBuildingNumberText(prediction).match(/(\d+)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function matchesNumberPrefix(prediction, numberPrefix) {
  if (!numberPrefix) {
    return true;
  }
  const building = extractBuildingNumberText(prediction);
  if (!building) {
    return false;
  }
  return building.toLowerCase().startsWith(numberPrefix.toLowerCase());
}

/**
 * When the user types "Avanesov 1", return building numbers that start with "1"
 * (1, 10–19, 1/2, …). With no number yet, fan out a broad candidate list.
 */
function getBuildingNumberCandidates(numberPrefix) {
  if (!numberPrefix) {
    return BUILDING_NUMBER_CANDIDATES.map(String);
  }

  const prefix = numberPrefix.toLowerCase();
  const candidates = new Set([numberPrefix]);

  for (const number of BUILDING_NUMBER_CANDIDATES) {
    const asText = String(number);
    if (asText.startsWith(prefix)) {
      candidates.add(asText);
    }
  }

  // Single-digit prefix → also try teens / that decade (1 → 10–19).
  if (/^\d$/.test(numberPrefix)) {
    for (let i = 0; i <= 9; i += 1) {
      candidates.add(`${numberPrefix}${i}`);
    }
  }

  // Common fractional buildings in Yerevan (1/2, 10/1, …).
  if (/^\d+[a-zA-ZԱ-Ֆա-ֆ]?$/u.test(numberPrefix)) {
    for (const fraction of ['/1', '/2', '/3', '/4', '/5']) {
      candidates.add(`${numberPrefix}${fraction}`);
    }
  }

  // Prefix already includes a fraction start like "1/" → try 1/1 … 1/5.
  if (/^\d+\/$/.test(numberPrefix)) {
    for (let i = 1; i <= 5; i += 1) {
      candidates.add(`${numberPrefix}${i}`);
    }
  }

  return [...candidates].sort((a, b) => {
    const aNum = Number.parseInt(a, 10);
    const bNum = Number.parseInt(b, 10);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum) && aNum !== bNum) {
      return aNum - bNum;
    }
    return a.localeCompare(b, 'en', { numeric: true });
  });
}

function buildAutocompleteParams(input) {
  return {
    input,
    key: ENV.GOOGLE_PLACES_API_KEY,
    language: 'hy',
    components: 'country:am',
    types: 'address',
    ...YEREVAN_BIAS,
  };
}

async function fetchAutocompletePredictions(input, signal) {
  const params = new URLSearchParams(buildAutocompleteParams(input));
  const response = await fetch(`${AUTOCOMPLETE_URL}?${params}`, { signal });
  const json = await response.json();

  if (json.status === 'OK' || json.status === 'ZERO_RESULTS') {
    return json.predictions ?? [];
  }

  if (json.status === 'REQUEST_DENIED' || json.status === 'OVER_QUERY_LIMIT') {
    throw new Error(json.error_message || json.status);
  }

  return [];
}

/**
 * Google Autocomplete returns ≤5 predictions per call. We fan out
 * "{street} {building}" queries (scoped to the typed number prefix when
 * present) and merge unique hits so the list follows what the user typed.
 */
async function fetchExpandedAddressSuggestions(input, signal) {
  const trimmed = input.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const { street, numberPrefix } = parseAddressQuery(trimmed);
  const byId = new Map();

  const addPredictions = (predictions) => {
    for (const prediction of predictions) {
      if (prediction?.place_id && !byId.has(prediction.place_id)) {
        byId.set(prediction.place_id, prediction);
      }
    }
  };

  const matchingBuildingCount = () =>
    [...byId.values()].filter((prediction) =>
      matchesNumberPrefix(prediction, numberPrefix),
    ).length;

  // Always search exactly what the user typed first.
  addPredictions(await fetchAutocompletePredictions(trimmed, signal));

  const expandBase = street.length >= MIN_QUERY_LENGTH ? street : trimmed;
  const expandQueries = getBuildingNumberCandidates(numberPrefix)
    .map((number) => `${expandBase} ${number}`)
    .filter((query) => query.toLowerCase() !== trimmed.toLowerCase());

  for (let i = 0; i < expandQueries.length; i += EXPAND_BATCH_SIZE) {
    if (signal?.aborted) {
      break;
    }

    // Stop once we have enough results that match the typed number prefix.
    if (matchingBuildingCount() >= MIN_BUILDING_RESULTS) {
      break;
    }

    const batch = expandQueries.slice(i, i + EXPAND_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((query) => fetchAutocompletePredictions(query, signal)),
    );
    batchResults.forEach(addPredictions);
  }

  let merged = [...byId.values()];

  if (numberPrefix) {
    const matching = merged.filter((prediction) =>
      matchesNumberPrefix(prediction, numberPrefix),
    );
    const rest = merged.filter(
      (prediction) => !matchesNumberPrefix(prediction, numberPrefix),
    );
    // Prefer buildings that start with the typed number (1 → 1, 10, 12…).
    merged = matching.length > 0 ? [...matching, ...rest] : merged;
  }

  merged.sort((a, b) => {
    if (numberPrefix) {
      const aMatch = matchesNumberPrefix(a, numberPrefix) ? 0 : 1;
      const bMatch = matchesNumberPrefix(b, numberPrefix) ? 0 : 1;
      if (aMatch !== bMatch) {
        return aMatch - bMatch;
      }
    }

    const aHasNumber = predictionHasBuildingNumber(a) ? 0 : 1;
    const bHasNumber = predictionHasBuildingNumber(b) ? 0 : 1;
    if (aHasNumber !== bHasNumber) {
      return aHasNumber - bHasNumber;
    }

    const byNumber = extractBuildingSortValue(a) - extractBuildingSortValue(b);
    if (byNumber !== 0) {
      return byNumber;
    }

    return (a.description || '').localeCompare(b.description || '', 'hy');
  });

  // When a number was typed, keep the list focused on that prefix.
  if (numberPrefix) {
    const matching = merged.filter((prediction) =>
      matchesNumberPrefix(prediction, numberPrefix),
    );
    if (matching.length > 0) {
      return matching.slice(0, MAX_SUGGESTIONS);
    }
  }

  return merged.slice(0, MAX_SUGGESTIONS);
}

async function fetchPlaceDetails(placeId, signal) {
  const params = new URLSearchParams({
    placeid: placeId,
    key: ENV.GOOGLE_PLACES_API_KEY,
    language: 'hy',
    region: 'am',
    fields: 'address_component,formatted_address,geometry,name',
  });
  const response = await fetch(`${DETAILS_URL}?${params}`, { signal });
  const json = await response.json();
  if (json.status !== 'OK' || !json.result) {
    return null;
  }
  return json.result;
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
      overflow: 'visible',
      zIndex: 1,
    },
    containerElevated: {
      zIndex: 50,
      elevation: 50,
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
      zIndex: 1,
    },
    inputError: {
      borderColor: colors.error,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 45,
      paddingHorizontal: 16,
      gap: 10,
      zIndex: 1,
    },
    inputIcon: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    endButton: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 3,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 100,
    },
    textInput: {
      flex: 1,
      height: 45,
      margin: 0,
      padding: 0,
      fontSize: 15,
      fontFamily: FONT_FAMILY.regular,
      color: colors.text,
    },
    listView: {
      position: 'absolute',
      bottom: '100%',
      left: 0,
      right: 0,
      marginBottom: 4,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.input,
      maxHeight: SUGGESTIONS_MAX_HEIGHT,
      borderRadius: INPUT_RADIUS,
      overflow: 'hidden',
      zIndex: 100,
      elevation: 100,
      shadowColor: colors.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -4 },
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 52,
      backgroundColor: colors.input,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
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
    loaderRow: {
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      fontSize: 12,
      fontFamily: FONT_FAMILY.regular,
      color: colors.error,
      marginTop: -4,
    },
  });

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
  onElevateChange,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputText, setInputText] = useState(() => value ?? '');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const inputContainerRef = useRef(null);
  const syncedValueRef = useRef(value ?? '');
  const localizationRequestRef = useRef(0);
  const searchRequestRef = useRef(0);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const suppressSearchRef = useRef(false);
  const isSelectingRef = useRef(false);
  const { onInputFocus, onInputBlur } = useEnsureInputVisible(inputContainerRef);

  const showSuggestions = suggestions.length > 0 || isSearching;

  useEffect(() => {
    onElevateChange?.(isFocused || showSuggestions);
  }, [isFocused, showSuggestions, onElevateChange]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setIsSearching(false);
  }, []);

  const runSearch = useCallback(
    async (query) => {
      const requestId = ++searchRequestRef.current;
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsSearching(true);

      try {
        const results = await fetchExpandedAddressSuggestions(query, controller.signal);
        if (requestId !== searchRequestRef.current) {
          return;
        }
        setSuggestions(results);
      } catch (error) {
        if (error?.name === 'AbortError') {
          return;
        }
        console.warn(`[FormAddressField:${name}]`, error?.message || error);
        if (requestId === searchRequestRef.current) {
          setSuggestions([]);
        }
      } finally {
        if (requestId === searchRequestRef.current) {
          setIsSearching(false);
        }
      }
    },
    [name],
  );

  const scheduleSearch = useCallback(
    (query) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const trimmed = query.trim();
      if (trimmed.length < MIN_QUERY_LENGTH) {
        abortControllerRef.current?.abort();
        clearSuggestions();
        return;
      }

      debounceTimerRef.current = setTimeout(() => {
        runSearch(trimmed);
      }, SEARCH_DEBOUNCE_MS);
    },
    [clearSuggestions, runSearch],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const nextValue = value ?? '';
    if (nextValue === syncedValueRef.current) {
      return;
    }

    suppressSearchRef.current = true;
    syncedValueRef.current = nextValue;
    setInputText(nextValue);
    clearSuggestions();
  }, [value, clearSuggestions]);

  const applySelectedAddress = useCallback(
    (address, details, data) => {
      suppressSearchRef.current = true;
      syncedValueRef.current = address;
      setInputText(address);
      onChange(address);
      clearSuggestions();

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

        suppressSearchRef.current = true;
        syncedValueRef.current = armenianAddress;
        setInputText(armenianAddress);
        onChange(armenianAddress);
      });
    },
    [clearSuggestions, onChange],
  );

  const handleSelectSuggestion = useCallback(
    async (prediction) => {
      isSelectingRef.current = true;
      setIsSelecting(true);
      suppressSearchRef.current = true;
      clearSuggestions();

      try {
        const details = await fetchPlaceDetails(prediction.place_id);
        const address = buildDetailedAddress(prediction, details);
        applySelectedAddress(address, details, prediction);
      } catch (error) {
        console.warn(`[FormAddressField:${name}] details failed`, error);
        applySelectedAddress(prediction.description ?? '', null, prediction);
      } finally {
        isSelectingRef.current = false;
        setIsSelecting(false);
      }
    },
    [applySelectedAddress, clearSuggestions, name],
  );

  const handleChangeText = useCallback(
    (text) => {
      if (suppressSearchRef.current) {
        suppressSearchRef.current = false;
      }

      setInputText(text);
      syncedValueRef.current = text;
      onChange(text);

      if (!text.trim()) {
        clearSuggestions();
        return;
      }

      scheduleSearch(text);
    },
    [clearSuggestions, onChange, scheduleSearch],
  );

  const handleClear = useCallback(() => {
    suppressSearchRef.current = true;
    syncedValueRef.current = '';
    setInputText('');
    onChange('');
    clearSuggestions();
  }, [clearSuggestions, onChange]);

  const showClearButton = isFocused && Boolean(inputText);

  const renderSuggestion = useCallback(
    (item) => {
      const primary = item?.structured_formatting?.main_text ?? item?.description ?? '';
      const secondary = item?.structured_formatting?.secondary_text ?? '';

      return (
        <Pressable
          key={item.place_id}
          onPress={() => handleSelectSuggestion(item)}
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.iconBox}>
            <LocationSvg width={18} height={18} fill={colors.icons} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.primaryText} numberOfLines={1}>
              {primary}
            </Text>
            {secondary ? (
              <Text style={styles.secondaryText} numberOfLines={1}>
                {secondary}
              </Text>
            ) : null}
          </View>
        </Pressable>
      );
    },
    [colors.icons, handleSelectSuggestion, styles],
  );

  return (
    <View
      ref={inputContainerRef}
      collapsable={false}
      style={[styles.field, isFocused && styles.fieldFocused]}
    >
      <View style={[styles.autocompleteWrapper, hasError && styles.inputError]}>
        {showSuggestions ? (
          <View style={styles.listView}>
            {isSearching && suggestions.length === 0 ? (
              <View style={styles.loaderRow}>
                <ActivityIndicator color={colors.icons} />
              </View>
            ) : (
              <ScrollView
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled
                bounces={false}
              >
                {suggestions.map(renderSuggestion)}
              </ScrollView>
            )}
          </View>
        ) : null}

        <View style={styles.inputRow}>
          {startIcon ? <View style={styles.inputIcon}>{startIcon}</View> : null}
          <TextInput
            value={inputText}
            onChangeText={handleChangeText}
            onFocus={() => {
              setIsFocused(true);
              onInputFocus();
              if (inputText.trim().length >= MIN_QUERY_LENGTH && !suppressSearchRef.current) {
                scheduleSearch(inputText);
              }
            }}
            onBlur={() => {
              setIsFocused(false);
              onInputBlur();
              onBlur();
              // Delay hide so a tap on a suggestion can register first.
              setTimeout(() => {
                if (!isSelectingRef.current) {
                  clearSuggestions();
                }
              }, 180);
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.textDisabled}
            autoCorrect={false}
            style={styles.textInput}
          />
          {isSelecting || isSearching ? (
            <ActivityIndicator size="small" color={colors.icons} />
          ) : showClearButton ? (
            <Pressable
              onPressIn={handleClear}
              hitSlop={8}
              style={styles.endButton}
              accessibilityRole="button"
              accessibilityLabel="Մաքրել"
            >
              <CloseIcon width={15} height={15} fill={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
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
  const [elevated, setElevated] = useState(false);

  const renderField = useCallback(
    ({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
      <View style={[styles.container, elevated && styles.containerElevated]}>
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
          onElevateChange={setElevated}
        />
        {error?.message ? <Text style={styles.errorText}>{error.message}</Text> : null}
      </View>
    ),
    [styles, colors, label, labelVariant, placeholder, startIcon, name, elevated],
  );

  return <Controller control={control} name={name} rules={rules} render={renderField} />;
}
