import { Pressable, StyleSheet, View } from 'react-native';
import { RadioButton, RadioGroup, Typography } from '../../../../../components';
import { showInfoSheet } from '../../../../../components/GlobalSheet';
import InfoSvg from '../../../../../components/icons/InfoSvg';
import { useThemedStyles } from '../../../../../hooks';
import { palette } from '../../../../../theme';

const DEFAULT_FACT_INFO_VIDEO_URL =
  'https://youtu.be/7_mQR-7QAQY?si=-er5ZoAIe-UHCgjb';

function hasFactInfo(fact) {
  return Boolean(fact.description?.trim());
}

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

  const handleShowFactDescription = fact => {
    const description = fact.description?.trim();
    if (!description) {
      return;
    }

    showInfoSheet({
      title: fact.name,
      description,
      videoUrl: DEFAULT_FACT_INFO_VIDEO_URL,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {facts.map(({ fact }) => {
          const isSelected = selectedFactIds.includes(fact.id);
          const showInfoBadge = hasFactInfo(fact);

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
              <View style={styles.factButtonContent}>
                <Typography variant="h5" numberOfLines={2} style={styles.factButtonText}>
                  {fact.name}
                </Typography>
                {showInfoBadge ? (
                  <Pressable
                    onPress={() => handleShowFactDescription(fact)}
                    style={styles.infoBadge}
                    hitSlop={8}
                  >
                    <InfoSvg width={22} height={22} fill={palette.white} />
                  </Pressable>
                ) : null}
              </View>
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
      borderRadius: 16,
      backgroundColor: colors.input,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    factButtonContent: {
      width: '100%',
      minHeight: 28,
      justifyContent: 'center',
    },
    factButtonText: {
      width: '90%',
    },
    infoBadge: {
      position: 'absolute',
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 50,
      backgroundColor: colors.icons,
      alignItems: 'center',
      justifyContent: 'center',
    },
    factButtonSelected: {
      borderColor: colors.icons,
      backgroundColor: colors.cardSelected,
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
