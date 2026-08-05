import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { personalDocumentsApi } from '../../../api';
import { Typography } from '../../../components';
import SadIcon from '../../../components/icons/SadIcon';
import { useThemedStyles, useTheme } from '../../../hooks';
import { FileFilterHeader } from './components/FileFilterHeader';
import { PersonalDocumentCard } from './components/PersonalDocumentCard';
import { TAB_BAR_HEIGHT } from '../../../utils/dimensions';
import { mapPersonalDocumentToFile } from './utils/mapPersonalDocumentToFile';

const PAGE_LIMIT = 100;

export function FilesMainScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);
  const hasFilesRef = useRef(false);

  const fetchFiles = useCallback(async (pageToLoad, { append = false } = {}) => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setError(null);

    if (append) {
      setIsLoadingMore(true);
    } else if (!hasFilesRef.current) {
      setIsLoading(true);
    }

    try {
      const response = await personalDocumentsApi.getPersonalDocuments({
        page: pageToLoad,
        limit: PAGE_LIMIT,
        ...(searchTerm ? { searchTerm } : {}),
      });
      const { data = [], total: responseTotal = 0, lastPage: responseLastPage = 1 } =
        response.data ?? {};
      const mappedFiles = data.map(mapPersonalDocumentToFile);

      setFiles(currentFiles =>
        append ? [...currentFiles, ...mappedFiles] : mappedFiles,
      );
      setPage(pageToLoad);
      setTotal(responseTotal);
      setLastPage(Number(responseLastPage) || 1);
    } catch (fetchError) {
      setError(fetchError?.message || 'Չհաջողվեց բեռնել ֆայլերը');
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    hasFilesRef.current = files.length > 0;
  }, [files.length]);

  useEffect(() => {
    fetchFiles(1);
  }, [fetchFiles]);

  const sections = useMemo(() => {
    const defaultFiles = [];
    const additionalFiles = [];

    for (const file of files) {
      if (file.isDefault) {
        defaultFiles.push(file);
      } else {
        additionalFiles.push(file);
      }
    }

    const nextSections = [];

    if (defaultFiles.length > 0) {
      nextSections.push({
        key: 'default',
        title: 'Հիմնական ֆայլեր',
        data: defaultFiles,
        indexOffset: 0,
      });
    }

    if (additionalFiles.length > 0) {
      nextSections.push({
        key: 'additional',
        title: 'Լրացուցիչ ֆայլեր',
        data: additionalFiles,
        indexOffset: defaultFiles.length,
      });
    }

    return nextSections;
  }, [files]);

  const handleSearchChange = useCallback(term => {
    setSearchTerm(current => (current === term ? current : term));
  }, []);

  const hasMorePages = page < lastPage;

  const handleLoadMore = useCallback(() => {
    if (!hasMorePages || isLoading || isLoadingMore) {
      return;
    }

    fetchFiles(page + 1, { append: true });
  }, [fetchFiles, hasMorePages, isLoading, isLoadingMore, page]);

  const handleRetry = useCallback(() => {
    fetchFiles(1);
  }, [fetchFiles]);

  const handleFileDeleted = useCallback(
    (deletedId, { isDefault = false } = {}) => {
      // Default slots are reset by the API (not permanently removed), so refetch.
      if (isDefault) {
        fetchFiles(1);
        return;
      }

      setFiles(currentFiles =>
        currentFiles.filter(file => file.id !== deletedId),
      );
      setTotal(currentTotal => Math.max(0, currentTotal - 1));
    },
    [fetchFiles],
  );

  const handleFileUploaded = useCallback(() => {
    fetchFiles(1);
  }, [fetchFiles]);

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
      searchTerm.trim().length > 0 ? 'Այս հարցումով ֆայլեր չեն գտնվել' : 'Ֆայլեր չեն գտնվել';

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
    error,
    handleRetry,
    isLoading,
    searchTerm,
    styles.centeredState,
    styles.retryButton,
    styles.stateText,
  ]);

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <Typography
        variant="h4"
        style={[
          styles.sectionTitle,
          section.key === 'additional' && styles.additionalSectionTitle,
        ]}
      >
        {section.title}
      </Typography>
    ),
    [styles.additionalSectionTitle, styles.sectionTitle],
  );

  const renderItem = useCallback(
    ({ item, index, section }) => (
      <PersonalDocumentCard
        document={item}
        index={section.indexOffset + index}
        onDeleted={handleFileDeleted}
        onUploaded={handleFileUploaded}
      />
    ),
    [handleFileDeleted, handleFileUploaded],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <FileFilterHeader
          onSearchChange={handleSearchChange}
          total={total}
          onFileUploaded={handleFileUploaded}
        />
      </View>
      <SectionList
        style={styles.list}
        sections={sections}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyComponent}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[
          styles.listContent,
          sections.length === 0 && styles.listContentEmpty,
          { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        renderItem={renderItem}
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
    sectionTitle: {
      letterSpacing: 0.4,
      paddingTop:8,
      paddingBottom: 18,
    },
    additionalSectionTitle: {
      paddingTop: 20,
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
  });
