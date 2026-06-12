import { StyleSheet, View } from 'react-native';
import { useThemedStyles } from '../../hooks';

export function StepIndicator({ steps, currentStep = 0 }) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <View key={step.key ?? index} style={styles.stepRow}>
            <View style={styles.stepContent}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isActive && styles.circleActive,
                ]}
              />
            </View>
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
    },
    stepContent: {
      alignItems: 'center',
      width: '100%',
      gap: 10,
    },
    circle: {
      width: '100%',
      height: 8,
      borderRadius: 14,
      opacity: 0.4,
      backgroundColor: colors.mainBlue,
    },
    circleActive: {
      opacity: 1,
      backgroundColor: colors.mainBlue,
    },
    circleCompleted: {
      backgroundColor: colors.mainBlue,
    },
  });
