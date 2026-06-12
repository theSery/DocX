import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import { FormDateField, FormField } from '../../../../../components';
import CalendarSvg from '../../../../../components/icons/CalendarSvg';
import { palette } from '../../../../../theme';
import ActNumberSvg from '../../../../../components/icons/ActNumberSvg';
import { useAppDispatch } from '../../../../../store';
import { setActDate, setActNumber } from '../../../../../store/slices/documentFillSlice';

export function FillAct({ control }) {
  const dispatch = useAppDispatch();
  const actNumber = useWatch({ control, name: 'Act_number' });
  const actDate = useWatch({ control, name: 'Act_date' });

  useEffect(() => {
    dispatch(setActNumber(actNumber ?? ''));
  }, [actNumber, dispatch]);

  useEffect(() => {
    dispatch(setActDate(actDate ?? null));
  }, [actDate, dispatch]);

  return (
    <View style={styles.container}>

      <FormField
        control={control}
        name="Act_number"
        label="Որոշման համար *"
        placeholder="1 2 3 4 5 6 7"
        startIcon={<ActNumberSvg width={17} height={19} fill={palette.gray} />}
        rules={{
          required: 'Որոշման համարը պարտադիր է',
          validate: value =>
            (typeof value === 'string' && value.trim().length > 0) || 'Որոշման համարը պարտադիր է',
        }}
      />
      <FormDateField
        control={control}
        name="Act_date"
        label="Որոշման ամսաթիվ *"
        startIcon={<CalendarSvg width={20} height={20} fill={palette.gray} />}
        rules={{
          required: 'Որոշման ամսաթիվը պարտադիր է',
          validate: value =>
            value instanceof Date || 'Որոշման ամսաթիվը պարտադիր է',
        }}
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
