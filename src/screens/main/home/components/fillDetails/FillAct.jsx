import { StyleSheet, View } from 'react-native';
import { FormDateField, FormField } from '../../../../../components';
import CalendarSvg from '../../../../../components/icons/CalendarSvg';
import { palette } from '../../../../../theme';

export function FillAct({ control }) {
  return (
    <View style={styles.container}>
      <FormDateField
        control={control}
        name="actDate"
        label="Ամսաթիվ"
        startIcon={<CalendarSvg width={20} height={20} fill={palette.mainBlue} />}
      />
      <FormField
        control={control}
        name="actField"
        label="Մանրամաս"
        placeholder="Մուտքագրեք մանրամասը"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingTop: 8,
  },
});
