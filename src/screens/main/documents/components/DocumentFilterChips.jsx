import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Typography } from '../../../../components';
import { FONT_FAMILY } from '../../../../theme';
import { useThemedStyles } from '../../../../hooks';

export function DocumentFilterChips({ filters, activeFilterId, onFilterChange }) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.wrapper}>
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
              style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
            >
              <Typography
                variant="h5"
                style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}
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
      marginBottom: 4,
    },
    container: {
      paddingHorizontal: 16,
      gap: 8,
    },
    chip: {
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    chipActive: {
      backgroundColor: colors.primary,
    },
    chipInactive: {
      backgroundColor: colors.input,
      borderWidth: 1,
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
      color: colors.primary,
    },
  });
