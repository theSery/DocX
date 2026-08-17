import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { favoriteTemplatesApi } from '../../../api';
import { Typography } from '../../../components';
import { showGlobalSheet } from '../../../components/GlobalSheet';
import SadIcon from '../../../components/icons/SadIcon';
import { useThemedStyles, useTheme, useToast } from '../../../hooks';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchComplaints,
  removeComplaint,
  selectComplaints,
  selectComplaintsError,
  selectComplaintsFilters,
  selectComplaintsIsFetching,
  selectComplaintsPagination,
  selectComplaintsStatus,
} from '../../../store/slices/complaintsSlice';
import { getRecommendedDocumentIds } from '../../../utils/recommendedDocumentsStorage';
import { DocumentCard } from './components/DocumentCard';
import { DocumentFilterChips } from './components/DocumentFilterChips';
import { DOCUMENT_FILTERS } from './data/mockDocuments';
import { formatApiDate } from './utils/formatApiDate';
import { mapComplaintToDocument } from './utils/mapComplaintToDocument';
import { TAB_BAR_HEIGHT } from '../../../utils/dimensions';
import { sortDocumentsWithRecommended } from './utils/sortDocumentsWithRecommended';

const PAGE_LIMIT = 10;

function areFiltersEqual(current, applied) {
  return (
    current.searchTerm === applied.searchTerm &&
    current.recipientType === applied.recipientType &&
    current.startDate === applied.startDate &&
    current.endDate === applied.endDate
  );
}

export function DocumentsScreen({ route, navigation }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectComplaints);
  const status = useAppSelector(selectComplaintsStatus);
  const error = useAppSelector(selectComplaintsError);
  const pagination = useAppSelector(selectComplaintsPagination);
  const appliedFilters = useAppSelector(selectComplaintsFilters);
  const isFetching = useAppSelector(selectComplaintsIsFetching);

  const [activeFilterId, setActiveFilterId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [recommendedIds, setRecommendedIds] = useState([]);

  const documents = useMemo(
    () => items.map(mapComplaintToDocument),
    [items],
  );

  const isLoading = status === 'loading';
  const isLoadingMore = status === 'loadingMore';
  const errorMessage =
    error?.message ||
    (status === 'failed' ? 'Չհաջողվեց բեռնել փաստաթղթերը' : null);
  const { page, lastPage, total } = pagination;

  const startDate = formatApiDate(dateRange.startDate) || '';
  const endDate = formatApiDate(dateRange.endDate) || '';

  const currentFilters = useMemo(
    () => ({
      searchTerm,
      recipientType: activeFilterId,
      startDate,
      endDate,
    }),
    [activeFilterId, endDate, searchTerm, startDate],
  );

  const fetchComplaintsPage = useCallback(
    (pageToLoad, { append = false } = {}) => {
      dispatch(
        fetchComplaints({
          page: pageToLoad,
          limit: PAGE_LIMIT,
          searchTerm,
          recipientType: activeFilterId,
          startDate,
          endDate,
          append,
        }),
      );
    },
    [activeFilterId, dispatch, endDate, searchTerm, startDate],
  );

  useEffect(() => {
    getRecommendedDocumentIds().then(setRecommendedIds);
  }, []);

  const sortedDocuments = useMemo(
    () => sortDocumentsWithRecommended(documents, recommendedIds),
    [documents, recommendedIds],
  );

  useEffect(() => {
    // Skip when this screen already loaded the current filters.
    if (areFiltersEqual(currentFilters, appliedFilters) && status !== 'idle') {
      return;
    }

    fetchComplaintsPage(1);
    // Intentionally keyed on filters/fetch only — status/error updates
    // must not re-trigger fetches (would loop on failure).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilters, fetchComplaintsPage]);

  const refreshedAt = route?.params?.refreshedAt;
  const favoriteTemplateId = route?.params?.favoriteTemplateId;
  const favoriteCategoryName = route?.params?.categoryName;

  useEffect(() => {
    if (refreshedAt) {
      fetchComplaintsPage(1);
    }
  }, [refreshedAt, fetchComplaintsPage]);

  useEffect(() => {
    if (favoriteTemplateId == null) {
      return;
    }

    const templateId = favoriteTemplateId;
    const categoryName = favoriteCategoryName;

    navigation.setParams({
      favoriteTemplateId: undefined,
      categoryName: undefined,
    });

    showGlobalSheet({
      message: categoryName || 'Ձևանմուշ',
      description: 'Ցանկանո՞ւմ եք պահպանել այս ձևանմուշը որպես ընտրյալ։',
      actions: [
        {
          label: 'Այո',
          onPress: async () => {
            try {
              await favoriteTemplatesApi.addFavoriteTemplate({ templateId });
              showToast({
                title: 'Հաջողություն',
                body: 'Ձևանմուշը ավելացվել է ընտրյալներին։',
                type: 'success',
              });
            } catch (error) {
              showToast({
                title: 'Սխալ',
                body:
                  error?.message ??
                  'Չհաջողվեց ավելացնել ձևանմուշը ընտրյալներին։',
                type: 'error',
              });
            }
          },
        },
        { label: 'Ոչ', destructive: true },
      ],
    });
  }, [
    favoriteTemplateId,
    favoriteCategoryName,
    navigation,
    showToast,
  ]);

  const handleDateRangeChange = useCallback(range => {
    setDateRange(current => {
      if (
        current.startDate === range.startDate &&
        current.endDate === range.endDate
      ) {
        return current;
      }

      return range;
    });
  }, []);

  const handleSearchChange = useCallback(term => {
    setSearchTerm(current => (current === term ? current : term));
  }, []);

  const hasMorePages = page < lastPage;

  const handleLoadMore = useCallback(() => {
    if (!hasMorePages || isLoading || isLoadingMore || isFetching) {
      return;
    }

    fetchComplaintsPage(page + 1, { append: true });
  }, [
    fetchComplaintsPage,
    hasMorePages,
    isFetching,
    isLoading,
    isLoadingMore,
    page,
  ]);

  const handleRetry = useCallback(() => {
    fetchComplaintsPage(1);
  }, [fetchComplaintsPage]);

  const handleDocumentDeleted = useCallback(
    deletedId => {
      dispatch(removeComplaint(deletedId));
      setRecommendedIds(currentIds =>
        currentIds.filter(id => id !== String(deletedId)),
      );
    },
    [dispatch],
  );

  const handleDocumentSent = useCallback(() => {
    fetchComplaintsPage(1);
  }, [fetchComplaintsPage]);

  const renderEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={styles.centeredState}>
          <Typography variant="h5" tone="secondary" style={styles.stateText}>
            {errorMessage}
          </Typography>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleRetry}
            style={styles.retryButton}
          >
            <Typography variant="h6" tone="onDark">
              Կրկին փորձել
            </Typography>
          </TouchableOpacity>
        </View>
      );
    }

    const emptyMessage =
      sortedDocuments.length > 0
        ? 'Այս ֆիլտրով փաստաթղթեր չեն գտնվել'
        : 'Փաստաթղթեր չեն գտնվել';

    return (
      <View style={styles.centeredState}>
        <SadIcon width={48} height={48} fill={colors.icons} />
        <Typography variant="h5" tone="secondary" style={styles.stateText}>
          {emptyMessage}
        </Typography>
      </View>
    );
  }, [
    colors.primary,
    colors.icons,
    sortedDocuments.length,
    errorMessage,
    handleRetry,
    isLoading,
    styles.centeredState,
    styles.retryButton,
    styles.stateText,
  ]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <DocumentFilterChips
          filters={DOCUMENT_FILTERS}
          activeFilterId={activeFilterId}
          onFilterChange={setActiveFilterId}
          onDateRangeChange={handleDateRangeChange}
          onSearchChange={handleSearchChange}
          total={total}
        />
      </View>
      <FlatList
        style={styles.list}
        data={sortedDocuments}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={[
          styles.listContent,
          sortedDocuments.length === 0 && styles.listContentEmpty,
          { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        renderItem={({ item, index }) => (
          <DocumentCard
            document={item}
            index={index}
            onDeleted={handleDocumentDeleted}
            onSent={handleDocumentSent}
          />
        )}
      />
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 4,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 4,
    },
    listContentEmpty: {
      flexGrow: 1,
    },
    centeredState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      gap: 12,
    },
    stateText: {
      textAlign: 'center',
      paddingHorizontal: 24,
    },
    retryButton: {
      marginTop: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    footerLoader: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    paginationInfo: {
      paddingTop: 4,
      paddingBottom: 8,
      alignItems: 'center',
    },
    paginationText: {
      textAlign: 'center',
    },
  });
