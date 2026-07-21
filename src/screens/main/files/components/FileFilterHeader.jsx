import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { FormField, Typography } from '../../../../components';
import SearchIcon from '../../../../components/icons/SearchIcon';
import UploadSvg from '../../../../components/icons/UploadSvg';
import { useTheme, useThemedStyles } from '../../../../hooks';
import { delay } from '../../../../utils/delay';
import { SEARCH_DEBOUNCE_MS } from '../../../../utils/searchUtils';
import { useFileUpload } from '../hooks';

export function FileFilterHeader({ onSearchChange, total, onFileUploaded }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { control } = useForm({
    defaultValues: { search: '' },
  });
  const search = useWatch({ control, name: 'search' });
  const { handleAddPress, uploadSheet } = useFileUpload({ onUploaded: onFileUploaded });

  useEffect(() => {
    let cancelled = false;

    async function applySearch() {
      await delay(SEARCH_DEBOUNCE_MS);
      if (cancelled) {
        return;
      }

      onSearchChange?.(search.trim());
    }

    applySearch();

    return () => {
      cancelled = true;
    };
  }, [search, onSearchChange]);

  return (
    <View style={styles.wrapper}>
      {uploadSheet}
      <View>
        <Typography variant="h2" style={styles.title}>
          Ֆայլեր
        </Typography>
        <Typography variant="h6" tone="secondary" style={styles.subTitle}>
          Ընդհանուր {total} ֆայլ
        </Typography>
      </View>
      <View style={styles.searchFieldContainer}>
        <View style={styles.searchField}>
          <FormField
            control={control}
            name="search"
            isSearch
            placeholder="Որոնում"
            startIcon={
              <SearchIcon width={24} height={24} fill={colors.icons} />
            }
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
          <UploadSvg width={20} height={20} fill={colors.icons} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    wrapper: {
      marginVertical: 14,
    },
    title: {
      letterSpacing: 2,
    },
    subTitle: {
      marginBottom: 16,
      marginTop: 5,
      letterSpacing: 0.4,
    },
    searchField: {
      marginBottom: 16,
      width: '87%',
    },
    searchFieldContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    addButton: {
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
  });
