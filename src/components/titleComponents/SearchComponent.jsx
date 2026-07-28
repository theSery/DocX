import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { useNavigation } from '@react-navigation/native';
import { Typography } from '../typography';
import { useTheme, useThemedStyles } from '../../hooks';
import { SearchField } from '../form/SearchField';
import SearchIcon from '../icons/SearchIcon';
import Chevron from '../icons/Chevron';
import SadIcon from '../icons/SadIcon';
import { useAppSelector } from '../../store';
import { delay } from '../../utils/delay';
import {
  createExpandedGroupIds,
  DROPDOWN_RADIUS,
  flattenLegalIssues,
  groupSearchResultsByCategory,
  NO_RESULTS_LABEL,
  resolveBucket,
  resolveDropdownHeight,
  resolveScrollMaxHeight,
  resolveSearchState,
  ROW_HEIGHT,
  SEARCH_DEBOUNCE_MS,
  SEARCH_Z_INDEX,
  toggleExpandedGroupId,
} from '../../utils/searchUtils';

const ANIMATION = { duration: 280, easing: Easing.out(Easing.cubic) };

const createStyles = colors =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      zIndex: SEARCH_Z_INDEX,
      elevation: SEARCH_Z_INDEX,
      overflow: 'visible',
    },
    dropdown: {
      marginTop: -1,
      overflow: 'hidden',
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor: colors.iconAccent,
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      zIndex: SEARCH_Z_INDEX + 1,
      elevation: SEARCH_Z_INDEX + 1,
      flexDirection: 'column',
    },
    row: {
      minHeight: ROW_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
    },
    rowIcon: {
      width: 25,
      height: 25,
      resizeMode: 'contain',
      backgroundColor: colors.skyBlue,
      padding: 6,
      borderRadius: 10,
    },
    titleIcon: {
      width: 30,
      height: 30,
      resizeMode: 'contain',
    },
    rowText: {
      flex: 1,
    },
    groupHeader: {
      minHeight: ROW_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 12,
      backgroundColor: colors.skyBlue,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
    },
    groupHeaderPressed: {
      opacity: 0.85,
    },
    groupHeaderChevron: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    groupHeaderText: {
      flex: 1,
      letterSpacing: 0.4,
    },
    rowPressed: {
      backgroundColor: Platform.select({
        ios: colors.surface,
        default: colors.input,
      }),
    },
    noResultsRow: {
      borderBottomWidth: 1,
      borderBottomColor: colors.iconAccent,
      backgroundColor: Platform.select({
        ios: colors.input,
        default: colors.input,
      }),
    },
    noResultsLabel: {
      fontStyle: 'italic',
    },
    dropdownScroll: {
      flexGrow: 0,
      flexShrink: 1,
      
    },
    dropdownScrollContent: {
      flexGrow: 0,
    },
  });

export function SearchComponent({ categoryId, subCategoryId } = {}) {
  const navigation = useNavigation();
  const { isDarkMode, colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  // Scoped search (Category/SubCategory screens) covers a single category,
  // so the collapsible category header adds no value there.
  const showGroupHeaders = categoryId == null;
  const { items: categories } = useAppSelector(state => state.categories);
  const flattenedLegalIssues = useMemo(() => {
    const flattened = flattenLegalIssues(categories);
    if (categoryId == null) {
      return flattened;
    }
    return flattened.filter(
      entry =>
        entry.category.id === categoryId &&
        (subCategoryId == null || entry.subCategory.id === subCategoryId),
    );
  }, [categories, categoryId, subCategoryId]);

  const [search, setSearch] = useState('');
  const bucket = resolveBucket(search.length);
  const [searchResults, setSearchResults] = useState([]);
  const [showNoResults, setShowNoResults] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedGroupIds, setExpandedGroupIds] = useState(() => new Set());
  const height = useSharedValue(0);
  const lastSelectedRef = useRef(null);

  const groupedSearchResults = useMemo(
    () => groupSearchResultsByCategory(searchResults),
    [searchResults],
  );

  const dropdownContentHeight = useMemo(
    () =>
      resolveDropdownHeight({
        groupedResults: groupedSearchResults,
        expandedGroupIds,
        showNoResults,
        hasSearchResults: searchResults.length > 0,
        includeGroupHeaders: showGroupHeaders,
      }),
    [
      expandedGroupIds,
      groupedSearchResults,
      searchResults.length,
      showGroupHeaders,
      showNoResults,
    ],
  );

  const scrollMaxHeight = useMemo(
    () => resolveScrollMaxHeight({ dropdownContentHeight, showNoResults }),
    [dropdownContentHeight, showNoResults],
  );

  const closeDropdown = () => {
    height.value = withTiming(0, ANIMATION);
    setSearchResults([]);
    setShowNoResults(false);
    setIsDropdownOpen(false);
    setExpandedGroupIds(new Set());
  };

  const handleSelect = result => {
    lastSelectedRef.current = result.label;
    setSearch(result.label);
    closeDropdown();
    navigation.navigate('SubCategoryScreen', {
      item: result.subCategory.legalIssues,
      title: result.category.name,
      subtitle: result.subCategory.name,
      iconUrl: result.category.iconUrl,
      initialOpenKey: result.legalIssue?.id ?? result.id,
      categoryId: result.category.id,
      subCategoryId: result.subCategory.id,
    });
    handleClear();
  };

  const handleClear = () => {
    lastSelectedRef.current = null;
    setSearch('');
    closeDropdown();
  };

  useEffect(() => {
    let cancelled = false;

    async function applySearch() {
      await delay(SEARCH_DEBOUNCE_MS);
      if (cancelled) {
        return;
      }

      if (lastSelectedRef.current !== null && search === lastSelectedRef.current) {
        setSearchResults([]);
        setShowNoResults(false);
        setIsDropdownOpen(false);
        return;
      }

      lastSelectedRef.current = null;

      const nextState = resolveSearchState({
        bucket,
        flattenedLegalIssues,
        query: search,
      });

      setSearchResults(nextState.matches);
      setShowNoResults(nextState.showNoResults);
      setIsDropdownOpen(nextState.isDropdownOpen);
    }

    applySearch();

    return () => {
      cancelled = true;
    };
  }, [bucket, flattenedLegalIssues, search]);

  useEffect(() => {
    setExpandedGroupIds(
      groupedSearchResults.length > 0
        ? createExpandedGroupIds(groupedSearchResults)
        : new Set(),
    );
  }, [groupedSearchResults]);

  useEffect(() => {
    if (!isDropdownOpen || bucket === 'closed') {
      height.value = withTiming(0, ANIMATION);
      return;
    }

    height.value = withTiming(dropdownContentHeight, ANIMATION);
  }, [bucket, dropdownContentHeight, height, isDropdownOpen]);

  const animatedPanelStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: height.value === 0 ? 0 : 1,
  }));

  const blurType = isDarkMode ? 'dark' : 'light';
  const dropdownSurfaceStyle = {
    backgroundColor: Platform.select({
      android: isDarkMode ? 'rgba(17,17,29,0.55)' : 'rgba(255,255,255,0.55)',
      default: 'transparent',
    }),
  };

  return (
    <View style={styles.wrapper}>
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Որոնում"
        isDropdownOpen={isDropdownOpen}
        onClear={handleClear}
        startIcon={<SearchIcon width={24} height={24} fill={colors.primary} />}
      />

      <Animated.View
        style={[styles.dropdown, dropdownSurfaceStyle, animatedPanelStyle]}
        pointerEvents={bucket === 'closed' ? 'none' : 'auto'}
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={blurType}
          blurAmount={80}
          reducedTransparencyFallbackColor={colors.background}
        />
        {searchResults.length > 0 ? (
          <ScrollView
            style={[
              styles.dropdownScroll,
              scrollMaxHeight != null && { maxHeight: scrollMaxHeight },
            ]}
            contentContainerStyle={styles.dropdownScrollContent}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {groupedSearchResults.map(group => {
              const isExpanded =
                !showGroupHeaders || expandedGroupIds.has(group.id);

              return (
                <View key={group.id}>
                  {showGroupHeaders ? (
                    <Pressable
                      onPress={() =>
                        setExpandedGroupIds(prev =>
                          toggleExpandedGroupId(prev, group.id),
                        )
                      }
                      style={({ pressed }) => [
                        styles.groupHeader,
                        pressed && styles.groupHeaderPressed,
                      ]}
                    >
                      {group.iconUrl ? (
                        <Image source={{ uri: group.iconUrl }} style={styles.titleIcon} />
                      ) : null}
                      <Typography variant="h5" numberOfLines={1} style={styles.groupHeaderText}>
                        {group.name}
                      </Typography>
                      <View style={styles.groupHeaderChevron}>
                        <Chevron
                          width={16}
                          height={16}
                          fill={colors.iconAccent}
                          rotate={isExpanded ? -90 : 90}
                        />
                      </View>
                    </Pressable>
                  ) : null}
                  {isExpanded
                    ? group.results.slice(0, 10).map(result => (
                        <Pressable
                          key={result.id}
                          onPress={() => handleSelect(result)}
                          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                        >
                          {result.subCategory.iconUrl ? (
                            <Image
                              source={{ uri: result.subCategory.iconUrl }}
                              style={styles.rowIcon}
                            />
                          ) : null}
                          <Typography variant="h6" numberOfLines={2} style={styles.rowText}>
                            {result.label}
                          </Typography>
                        </Pressable>
                      ))
                    : null}
                </View>
              );
            })}
          </ScrollView>
        ) : null}
        {showNoResults && (!searchResults || searchResults.length === 0) ? (
          <View style={[styles.row, styles.noResultsRow]}>
            <SadIcon width={20} height={20} fill={colors.textSecondary} />
            <Typography
              variant="h5"
              tone="secondary"
              style={[styles.noResultsLabel, styles.rowText]}
              numberOfLines={1}
            >
              {NO_RESULTS_LABEL}
            </Typography>
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}
