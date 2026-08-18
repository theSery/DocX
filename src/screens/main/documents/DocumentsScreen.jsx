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
const datatF = [      {
  "id": 186,
  "documentName": "Բողոք ՀՀ ՆԳՆ պարեկային ծառայությանը.pdf",
  "sendDate": "2026-08-18T03:32:00.543Z",
  "recipientType": "addressee",
  "recipientValue": "lawyerhovhannisyan@gmail.com",
  "fileId": 811,
  "fileName": "1787023919072-%D4%B2%D5%B8%D5%B2%D5%B8%D6%84%20%D5%80%D5%80%20%D5%86%D4%B3%D5%86%20%D5%BA%D5%A1%D6%80%D5%A5%D5%AF%D5%A1%D5%B5%D5%AB%D5%B6%20%D5%AE%D5%A1%D5%BC%D5%A1%D5%B5%D5%B8%D6%82%D5%A9%D5%B5%D5%A1%D5%B6%D5%A8.pdf",
  "fileUrl": "https://craoc.upcloudobjects.com/docx-bucket/complaints/user-265/1787023919072-%25D4%25B2%25D5%25B8%25D5%25B2%25D5%25B8%25D6%2584%2520%25D5%2580%25D5%2580%2520%25D5%2586%25D4%25B3%25D5%2586%2520%25D5%25BA%25D5%25A1%25D6%2580%25D5%25A5%25D5%25AF%25D5%25A1%25D5%25B5%25D5%25AB%25D5%25B6%2520%25D5%25AE%25D5%25A1%25D5%25BC%25D5%25A1%25D5%25B5%25D5%25B8%25D6%2582%25D5%25A9%25D5%25B5%25D5%25A1%25D5%25B6%25D5%25A8.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIABA8D8136DEB5CD99%2F20260818%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260818T034832Z&X-Amz-Expires=3600&X-Amz-Signature=a97ec0bf488bf17a935f0ba69188ccef0efb5c6140d74b52969dc7c7b93447ad&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
  "downloadUrl": "https://craoc.upcloudobjects.com/docx-bucket/complaints/user-265/1787023919072-%25D4%25B2%25D5%25B8%25D5%25B2%25D5%25B8%25D6%2584%2520%25D5%2580%25D5%2580%2520%25D5%2586%25D4%25B3%25D5%2586%2520%25D5%25BA%25D5%25A1%25D6%2580%25D5%25A5%25D5%25AF%25D5%25A1%25D5%25B5%25D5%25AB%25D5%25B6%2520%25D5%25AE%25D5%25A1%25D5%25BC%25D5%25A1%25D5%25B5%25D5%25B8%25D6%2582%25D5%25A9%25D5%25B5%25D5%25A1%25D5%25B6%25D5%25A8.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIABA8D8136DEB5CD99%2F20260818%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260818T034832Z&X-Amz-Expires=3600&X-Amz-Signature=5fe059236dbf9502f7ab55a0c02fb7ce7408421891476c590136a9739736ea40&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D%22document.pdf%22&x-amz-checksum-mode=ENABLED&x-id=GetObject",
  "createdAt": "2026-08-18T03:31:59.071Z",
  "updatedAt": "2026-08-18T03:31:59.199Z",
  "attachedDocuments": [11, 6]
},]
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
        // data={datatF}
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
