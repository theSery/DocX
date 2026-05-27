import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useForm, useWatch } from 'react-hook-form';
import { Typography } from '../typography';
import { palette } from '../../theme';
import { FormField } from '../form/FormField';
import SearchIcon from '../icons/SearchIcon';
import { delay } from '../../utils/delay';

const ROW_HEIGHT = 44;
const MAX_ITEMS = 5;
const SMALL_ITEMS = 2;
const SHRINK_THRESHOLD = 4;
const MAX_HEIGHT = ROW_HEIGHT * MAX_ITEMS;
const SMALL_HEIGHT = ROW_HEIGHT * (SMALL_ITEMS + 1); // 2 rows + no-results row
const ANIMATION = { duration: 280, easing: Easing.out(Easing.cubic) };
const TYPING_DELAY_MS = 150;
const NO_RESULTS_LABEL = 'անհաջող որոնում';

const DATA_POOL = [
  'Անձնագիր',
  'Քաղվածք',
  'Տեղեկանք',
  'Արձանագրություն',
  'Վկայական',
  'Հայտարարություն',
  'Դիմում',
  'Պայմանագիր',
  'Արձակուրդային',
  'Թույլտվություն',
  'Հաշվետվություն',
  'Որոշում',
];

function pickRandomItems(count) {
  const copy = [...DATA_POOL];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const swap = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[swap]] = [copy[swap], copy[i]];
  }
  return copy.slice(0, count).map((label, index) => ({
    id: `${label}-${index}`,
    label,
  }));
}

function resolveBucket(length) {
  if (length === 0) {
    return 'closed';
  }
  if (length >= SHRINK_THRESHOLD) {
    return 'shrunk';
  }
  return 'expanded';
}

export function SearchComponent() {
  const { control, setValue } = useForm({ defaultValues: { search: '' } });
  const search = useWatch({ control, name: 'search' }) ?? '';
  const length = search.length;
  const bucket = resolveBucket(length);

  const [items, setItems] = useState([]);
  const [showNoResults, setShowNoResults] = useState(false);
  const height = useSharedValue(0);
  const lastBucket = useRef('closed');
  const lastSelectedRef = useRef(null);

  const closeDropdown = () => {
    height.value = withTiming(0, ANIMATION);
    setItems([]);
    setShowNoResults(false);
    lastBucket.current = 'closed';
  };

  const handleSelect = label => {
    lastSelectedRef.current = label;
    setValue('search', label, { shouldDirty: true, shouldTouch: true });
    closeDropdown();
  };

  const handleNoResultsPress = () => {
    lastSelectedRef.current = search;
    closeDropdown();
  };

  useEffect(() => {
    let cancelled = false;

    async function applyBucket() {
      await delay(TYPING_DELAY_MS);
      if (cancelled) {
        return;
      }

      if (lastSelectedRef.current !== null && search === lastSelectedRef.current) {
        height.value = withTiming(0, ANIMATION);
        setItems([]);
        setShowNoResults(false);
        lastBucket.current = 'closed';
        return;
      }
      lastSelectedRef.current = null;

      if (bucket === 'closed') {
        height.value = withTiming(0, ANIMATION);
        setItems([]);
        setShowNoResults(false);
        lastBucket.current = 'closed';
        return;
      }

      if (bucket === 'expanded') {
        if (lastBucket.current !== 'expanded') {
          setItems(pickRandomItems(MAX_ITEMS));
        }
        setShowNoResults(false);
        height.value = withTiming(MAX_HEIGHT, ANIMATION);
        lastBucket.current = 'expanded';
        return;
      }

      if (lastBucket.current !== 'shrunk') {
        setItems(pickRandomItems(SMALL_ITEMS));
      }
      setShowNoResults(true);
      height.value = withTiming(SMALL_HEIGHT, ANIMATION);
      lastBucket.current = 'shrunk';
    }

    applyBucket();

    return () => {
      cancelled = true;
    };
  }, [bucket, height, search]);

  const animatedPanelStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: height.value === 0 ? 0 : 1,
  }));

  return (
    <View style={styles.wrapper}>
      <FormField
        control={control}
        name="search"
        placeholder="Որոնում"
        startIcon={<SearchIcon width={24} height={24} fill={palette.mainBlue} />}
      />

      <Animated.View
        style={[styles.dropdown, animatedPanelStyle]}
        pointerEvents={bucket === 'closed' ? 'none' : 'auto'}
      >
        {items.map(item => (
          <Pressable
            key={item.id}
            onPress={() => handleSelect(item.label)}
            style={({ pressed }) => [
              styles.row,
              pressed && styles.rowPressed,
            ]}
          >
            <Typography variant="h5" style={styles.rowLabel} numberOfLines={1}>
              {item.label}
            </Typography>
          </Pressable>
        ))}
        {showNoResults ? (
          <Pressable
            onPress={handleNoResultsPress}
            style={({ pressed }) => [
              styles.row,
              styles.noResultsRow,
              pressed && styles.rowPressed,
            ]}
          >
            <Typography
              variant="h6"
              style={styles.noResultsLabel}
              numberOfLines={1}
            >
              {NO_RESULTS_LABEL}
            </Typography>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',

  },
  dropdown: {
    marginTop: 5,
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.lightGray,
    backgroundColor: palette.mainWhite,
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  row: {
    height: ROW_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.backgroundWhite,
  },
  rowPressed: {
    backgroundColor: palette.backgroundWhite,
  },
  rowLabel: {
    color: palette.black,
  },
  noResultsRow: {
    borderBottomWidth: 0,
    backgroundColor: palette.backgroundWhite,
  },
  noResultsLabel: {
    color: palette.gray,
    fontStyle: 'italic',
  },
});
