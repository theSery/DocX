import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DocumentCard } from './components/DocumentCard';
import { DocumentFilterChips } from './components/DocumentFilterChips';
import { DOCUMENT_FILTERS, MOCK_DOCUMENTS } from './data/mockDocuments';
import { useThemedStyles } from '../../../hooks';

const TAB_BAR_HEIGHT = 60;

export function DocumentsScreen() {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [activeFilterId, setActiveFilterId] = useState('all');

  const filteredDocuments = useMemo(() => {
    if (activeFilterId === 'all') {
      return MOCK_DOCUMENTS;
    }

    return MOCK_DOCUMENTS.filter(document => document.category === activeFilterId);
  }, [activeFilterId]);

  const renderListHeader = useCallback(
    () => (
      <DocumentFilterChips
        filters={DOCUMENT_FILTERS}
        activeFilterId={activeFilterId}
        onFilterChange={setActiveFilterId}
      />
    ),
    [activeFilterId],
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={filteredDocuments}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 24 },
        ]}
        showsVerticalScrollIndicator={false}
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
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 4,
    },
  });
