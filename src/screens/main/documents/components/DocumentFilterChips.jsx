import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { FormDateField, FormField, Typography } from '../../../../components';
import CalendarSvg from '../../../../components/icons/CalendarSvg';
import SearchIcon from '../../../../components/icons/SearchIcon';
import { useTheme, useThemedStyles } from '../../../../hooks';
import { FONT_FAMILY } from '../../../../theme';
import FilterSvg from '../../../../components/icons/FilterSvg';
import CloseIcon from '../../../../components/icons/CloseIcon';

export function DocumentFilterChips({
  filters,
  activeFilterId,
  onFilterChange,
  total,
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const { control, reset, getValues } = useForm({
    defaultValues: { search: '', startDate: null, endDate: null },
  });
  const startDate = useWatch({ control, name: 'startDate' });
  const endDate = useWatch({ control, name: 'endDate' });

  const handleDateFilterToggle = () => {
    if (isDateFilterOpen) {
      reset({ ...getValues(), startDate: null, endDate: null });
    }
    setIsDateFilterOpen(current => !current);
  };

  return (
    <View style={styles.wrapper}>
      <View>
        <Typography variant="h2" style={styles.loginTitle}>
          Փաստաթղթեր
        </Typography>
        <Typography variant="h6" style={styles.subTitle}>
          Ընդհանուր գեներացվել է {total} փաստաթուղթ
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
              <SearchIcon width={24} height={24} fill={colors.primary} />
            }
          />
        </View>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleDateFilterToggle}
        >
          {isDateFilterOpen ? (
            <CloseIcon width={20} height={20} fill={colors.textSecondary} />
          ) : (
            <FilterSvg width={20} height={20} fill={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {isDateFilterOpen ? (
        <View style={styles.dateRangeRow}>
          <View style={styles.dateField}>
            <FormDateField
              control={control}
              name="startDate"
              startIcon={
                <CalendarSvg
                  width={20}
                  height={20}
                  fill={colors.textSecondary}
                />
              }
              maximumDate={endDate instanceof Date ? endDate : undefined}
              buttonStyle={styles.dateFieldButton}
              textStyle={styles.dateFieldText}
            />
          </View>
          <Typography
            variant="h6"
            tone="secondary"
            style={styles.dateRangeSeparator}
          >
            —
          </Typography>
          <View style={styles.dateField}>
            <FormDateField
              control={control}
              name="endDate"
              startIcon={
                <CalendarSvg
                  width={20}
                  height={20}
                  fill={colors.textSecondary}
                />
              }
              minimumDate={startDate instanceof Date ? startDate : undefined}
              buttonStyle={styles.dateFieldButton}
              textStyle={styles.dateFieldText}
            />
          </View>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {filters.map(filter => {
          const isActive = filter.id === activeFilterId;

          return (
            <TouchableOpacity
              key={filter.id}
              activeOpacity={0.8}
              onPress={() => onFilterChange(filter.id)}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Typography
                variant="h6"
                tone="secondary"
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {filter.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    wrapper: {
      marginVertical: 14,
    },
    loginTitle: {
      letterSpacing: 2,
      // marginTop: 10,
    },
    subTitle: {
      color: colors.gray,
      marginBottom: 16,
      marginTop: 5,
      letterSpacing: 0.4,
    },
    searchField: {
      marginBottom: 16,
      width: '87%',
    },
    dateRangeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
      width: '87%',
    },
    dateField: {
      flex: 1,
    },
    dateRangeSeparator: {
      alignSelf: 'center',
    },
    container: {
      // paddingHorizontal: 16,
      gap: 10,
    },
    chip: {
      borderRadius: 6,
      paddingHorizontal: 14,
      paddingVertical: 4,
      // maarginVertical: 14,
    },
    chipActive: {
      backgroundColor: colors.primary,
    },
    chipInactive: {
      backgroundColor: '#E8EFFF',
      // borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    chipText: {
      fontFamily: FONT_FAMILY.medium,
      fontSize: 13,
      lineHeight: 18,
    },
    chipTextActive: {
      color: colors.buttonTextOnPrimary,
    },
    chipTextInactive: {
      // color: colors.primary,
    },
    dateFieldButton: {
      height: 30,
    },
    dateFieldText: {
      fontSize: 12,
      fontFamily: FONT_FAMILY.medium,
      // lineHeight: 18,
    },
    clearButton: {
      padding: 8,
      // width: 30,
      // height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    searchFieldContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
  });
