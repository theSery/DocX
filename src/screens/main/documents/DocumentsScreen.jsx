import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { complaintsApi } from '../../../api';
import { Typography } from '../../../components';
import SadIcon from '../../../components/icons/SadIcon';
import { useThemedStyles, useTheme } from '../../../hooks';
import { DocumentCard } from './components/DocumentCard';
import { DocumentFilterChips } from './components/DocumentFilterChips';
import { DOCUMENT_FILTERS } from './data/mockDocuments';
import { formatApiDate } from './utils/formatApiDate';
import { mapComplaintToDocument } from './utils/mapComplaintToDocument';

const TAB_BAR_HEIGHT = 60;
const PAGE_LIMIT = 10;

export function DocumentsScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeFilterId, setActiveFilterId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [documents, setDocuments] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);
  const hasDocumentsRef = useRef(false);

  const fetchComplaints = useCallback(async (pageToLoad, { append = false } = {}) => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setError(null);

    if (append) {
      setIsLoadingMore(true);
    } else if (!hasDocumentsRef.current) {
      setIsLoading(true);
    }

    try {
      const startDate = formatApiDate(dateRange.startDate);
      const endDate = formatApiDate(dateRange.endDate);

      const response = await complaintsApi.getComplaints({
        page: pageToLoad,
        limit: PAGE_LIMIT,
        ...(activeFilterId !== 'all' ? { recipientType: activeFilterId } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(searchTerm ? { searchTerm } : {}),
      });
      const { data = [], total: responseTotal = 0, lastPage: responseLastPage = 1 } =
        response.data ?? {};
      const mappedDocuments = data.map(mapComplaintToDocument);

      setDocuments(currentDocuments =>
        append ? [...currentDocuments, ...mappedDocuments] : mappedDocuments,
      );
      setPage(pageToLoad);
      setTotal(responseTotal);
      setLastPage(responseLastPage);
    } catch (fetchError) {
      setError(fetchError?.message || 'Չհաջողվեց բեռնել փաստաթղթերը');
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [activeFilterId, dateRange, searchTerm]);

  useEffect(() => {
    hasDocumentsRef.current = documents.length > 0;
  }, [documents.length]);

  useEffect(() => {
    fetchComplaints(1);
  }, [fetchComplaints]);

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
    if (!hasMorePages || isLoading || isLoadingMore) {
      return;
    }

    fetchComplaints(page + 1, { append: true });
  }, [fetchComplaints, hasMorePages, isLoading, isLoadingMore, page]);

  const handleRetry = useCallback(() => {
    fetchComplaints(1);
  }, [fetchComplaints]);

  const renderEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centeredState}>
          <Typography variant="h5" tone="secondary" style={styles.stateText}>
            {error}
          </Typography>
          <TouchableOpacity activeOpacity={0.8} onPress={handleRetry} style={styles.retryButton}>
            <Typography variant="h6" tone="onDark">
              Կրկին փորձել
            </Typography>
          </TouchableOpacity>
        </View>
      );
    }

    const emptyMessage =
      documents.length > 0 ? 'Այս ֆիլտրով փաստաթղթեր չեն գտնվել' : 'Փաստաթղթեր չեն գտնվել';

    return (
      <View style={styles.centeredState}>
        <SadIcon width={48} height={48} fill={colors.textDisabled} />
        <Typography variant="h5" tone="secondary" style={styles.stateText}>
          {emptyMessage}
        </Typography>
      </View>
    );
  }, [
    colors.primary,
    colors.textDisabled,
    documents.length,
    error,
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
        data={documents}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={[
          styles.listContent,
          documents.length === 0 && styles.listContentEmpty,
          { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        renderItem={({ item }) => <DocumentCard document={item} />}
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
