import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormField, Typography } from '../../../../components';
import SearchIcon from '../../../../components/icons/SearchIcon';
import { useTheme, useThemedStyles } from '../../../../hooks';
import { delay } from '../../../../utils/delay';
import { SEARCH_DEBOUNCE_MS } from '../../../../utils/searchUtils';

export function FileFilterHeader({ onSearchChange, total }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { control } = useForm({
    defaultValues: { search: '' },
  });
  const search = useWatch({ control, name: 'search' });

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
      <View>
        <Typography variant="h2" style={styles.title}>
          Ֆայլեր
        </Typography>
        <Typography variant="h6" style={styles.subTitle}>
          Ընդհանուր {total} ֆայլ
        </Typography>
      </View>
      <View style={styles.searchField}>
        <FormField
          control={control}
          name="search"
          isSearch
          placeholder="Որոնում"
          startIcon={
            <SearchIcon width={24} height={24} fill={colors.primary} />
          }
        />
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
      color: colors.gray,
      marginBottom: 16,
      marginTop: 5,
      letterSpacing: 0.4,
    },
    searchField: {
      marginBottom: 16,
    },
  });
