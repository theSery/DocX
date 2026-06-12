import { Pressable, StyleSheet, View } from 'react-native';
import { RadioButton, RadioGroup, Typography } from '../../../../../components';
import { useThemedStyles } from '../../../../../hooks';

export function FillDates({
  factGroup,
  setRadioFacts,
  factsCheck,
  selectedFacts,
  onSelectFact,
  errorMessage,
}) {
  const styles = useThemedStyles(createStyles);

  const groupId = factGroup?.id;
  const rawSelected = selectedFacts?.[groupId];
  const selectedFactIds = Array.isArray(rawSelected)
    ? rawSelected
    : rawSelected != null
      ? [rawSelected]
      : [];
  const facts = factGroup?.factGroupFacts ?? [];
  const radioFactGroups = factGroup?.radioFactGroups ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {facts.map(({ fact }) => {
          const isSelected = selectedFactIds.includes(fact.id);

          return (
            <Pressable
              key={fact.id}
              onPress={() => onSelectFact?.(fact, groupId)}
              style={({ pressed }) => [
                styles.factButton,
                isSelected && styles.factButtonSelected,
                pressed && styles.factButtonPressed,
              ]}
            >
              <Typography variant="h6" numberOfLines={2}>
                {fact.name}
              </Typography>
            </Pressable>
          );
        })}
        {radioFactGroups.map((item, outerIndex) => {
          const groupKey = item.id ?? outerIndex;

          return (
            <RadioGroup
              key={groupKey}
              style={styles.radioGroup}
              value={factsCheck?.[groupKey] ?? null}
              onChange={value =>
                setRadioFacts(prev => ({
                  ...prev,
                  [groupKey]: value,
                }))
              }
            >
              {item?.facts?.map(fact => (
                <RadioButton
                  key={fact.id}
                  value={fact.id}
                  label={fact.name}
                  style={styles.radioItem}
                />
              ))}
            </RadioGroup>
          );
        })}
      </View>
      {errorMessage ? (
        <Typography variant="h6" style={styles.errorText}>
          {errorMessage}
        </Typography>
      ) : null}
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    container: {
      paddingTop: 8,
      gap: 16,
    },
    grid: {
      flexDirection: 'column',
      flexWrap: 'wrap',
      gap: 10,
    },
    factButton: {
      width: '100%',
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.input,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    factButtonSelected: {
      borderColor: colors.mainBlue,
      backgroundColor: colors.skyBlue,
    },
    factButtonPressed: {
      opacity: 0.88,
    },
    radioGroup: {
      width: '100%',
      marginTop: 20,
      gap: 12,
    },
    radioItem: {
      marginTop: 0,
    },
    errorText: {
      color: colors.error,
      marginTop: 4,
    },
  });
