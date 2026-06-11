import { Pressable, StyleSheet, View } from 'react-native';
import { RadioButton, RadioGroup, Typography } from '../../../../../components';
import { useThemedStyles } from '../../../../../hooks';
import { FONT_FAMILY } from '../../../../../theme';

export function FillDates({ factGroup, setRadioFacts, factsCheck, selectedFactId, onSelectFact }) {
  const styles = useThemedStyles(createStyles);

  const facts = factGroup?.factGroupFacts ?? [];
  const radioFacts = factGroup?.radioFactGroups ?? [];

  return (
    <View style={styles.container}>
      <Typography variant="h4" style={styles.title}>
        {factGroup?.name}
      </Typography>
      <View style={styles.grid}>
        {facts.map(({ fact }) => {
          const isSelected = selectedFactId === fact.id;
          return (
            <Pressable
              key={fact.id}
              onPress={() => onSelectFact?.(fact)}
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
        {radioFacts.map((item, outerIndex) => {
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
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    container: {
      paddingTop: 8,
      gap: 16,
    },
    title: {
      letterSpacing: 0.4,
    },
    grid: {
      flexDirection: 'column',
      flexWrap: 'wrap',
      gap: 10,
      // backgroundColor: 'blue',
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
    factButtonText: {
      textAlign: 'center',
      fontFamily: FONT_FAMILY.regular,
      color: colors.text,
    },
    factButtonTextSelected: {
      fontFamily: FONT_FAMILY.medium,
      color: colors.mainBlue,
    },
    radioGroup: {
      width: '100%',
      marginTop: 20,
      gap: 12,
    },
    radioItem: {
      marginTop: 0,
    },
  });
