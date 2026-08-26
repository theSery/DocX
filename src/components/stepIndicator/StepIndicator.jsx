import { Pressable, StyleSheet, View } from 'react-native';
import { useThemedStyles } from '../../hooks';

export function StepIndicator({ steps, currentStep = 0, onStepPress }) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isPressable = Boolean(onStepPress) && index !== currentStep;

        return (
          <Pressable
            key={step.key ?? index}
            style={styles.stepRow}
            disabled={!isPressable}
            onPress={() => onStepPress?.(index)}
            hitSlop={{ top: 12, bottom: 12 }}
          >
            <View style={styles.stepContent}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isActive && styles.circleActive,
                ]}
              />
            </View>
          </Pressable>
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
      // paddingHorizontal: 10,
      // paddingVertical: 16,
      // marginTop: 10,
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
      backgroundColor: colors.icons,
    },
    circleActive: {
      opacity: 1,
      backgroundColor: colors.icons,
    },
    circleCompleted: {
      opacity: 1,
      backgroundColor: colors.icons,
    },
  });
