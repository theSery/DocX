import { StyleSheet, View } from 'react-native';
import { useThemedStyles } from '../../hooks';
import { FONT_FAMILY } from '../../theme';
import { Typography } from '../typography';

export function StepIndicator({ steps, currentStep = 0 }) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <View key={step.key ?? index} style={styles.stepRow}>
            <View style={styles.stepContent}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isActive && styles.circleActive,
                ]}
              >
                {/* <Typography
                  variant="h6"
                  tone={isActive || isCompleted ? 'onDark' : 'secondary'}
                  style={styles.stepNumber}
                >
                  {index + 1}
                </Typography> */}
              </View>
              {/* <Typography
                variant="h6"
                tone={isActive ? 'default' : 'secondary'}
                style={[styles.label, isActive && styles.labelActive]}
                numberOfLines={1}
              >
                {step.label}
              </Typography> */}
            </View>
            {/* {!isLast ? (
              <View
                style={[
                  styles.connector,
                  (isCompleted || isActive) && styles.connectorActive,
                ]}
              />
            ) : null} */}
          </View>
        );
      })}
    </View>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 16,
      backgroundColor: colors.background,
      gap: 10,
    },
    stepRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      // gap: 10,

    },
    stepContent: {
      alignItems: 'center',
      // minWidth: 56,
      width: '100%',
      // backgroundColor: 'red',
      gap: 10,
    },
    circle: {
      width: '100%',
      height: 8,
      borderRadius: 14,
      // borderWidth: 2,
      // borderColor: colors.border,
      opacity: 0.4,
      backgroundColor: colors.mainBlue,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleActive: {
      opacity: 1,
      backgroundColor: colors.mainBlue,
    },
    circleCompleted: {
      borderColor: colors.mainBlue,
      backgroundColor: colors.mainBlue,
    },
    stepNumber: {
      fontFamily: FONT_FAMILY.medium,
    },
    label: {
      marginTop: 6,
      textAlign: 'center',
      fontFamily: FONT_FAMILY.regular,
    },
    labelActive: {
      fontFamily: FONT_FAMILY.medium,
      color: colors.text,
    },
    connector: {
      flex: 1,
      height: 2,
      marginTop: -18,
      marginHorizontal: 4,
      backgroundColor: colors.border,
    },
    connectorActive: {
      backgroundColor: colors.primary,
    },
  });
