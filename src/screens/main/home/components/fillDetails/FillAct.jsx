import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import { FormDateField, FormField } from '../../../../../components';
import CalendarSvg from '../../../../../components/icons/CalendarSvg';
import ActNumberSvg from '../../../../../components/icons/ActNumberSvg';
import UserSvg from '../../../../../components/icons/UserSvg';
import { palette } from '../../../../../theme';
import { ARMENIAN_NAME_RULES } from '../../../../../utils/patterns';
import { useAppDispatch } from '../../../../../store';
import { setActDate, setActNumber } from '../../../../../store/slices/documentFillSlice';

function buildRules(variable) {
  const requiredMessage = `${variable.description} դաշտը պարտադիր է`;

  if (variable.dataType === 'date') {
    return {
      required: requiredMessage,
      validate: value => value instanceof Date || requiredMessage,
    };
  }

  if (variable.dataType === 'armenian') {
    return {
      ...ARMENIAN_NAME_RULES,
      required: requiredMessage,
    };
  }

  return {
    required: requiredMessage,
  };
}

function getFieldConfig(variable) {
  if (variable.dataType === 'digit') {
    return {
      keyboardType: 'numeric',
      startIcon: <ActNumberSvg width={17} height={19} fill={palette.gray} />,
    };
  }

  if (variable.dataType === 'armenian') {
    return {
      keyboardType: 'default',
      startIcon: <UserSvg width={24} height={24} fill={palette.gray} />,
    };
  }

  return {
    keyboardType: 'default',
    startIcon: null,
  };
}

export function FillAct({ control, variables = [] }) {
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
      {variables.map(variable => {
        if (variable.dataType === 'date') {
          return (
            <FormDateField
              key={variable.id ?? variable.name}
              control={control}
              name={variable.name}
              label={`${variable.description} *`}
              startIcon={<CalendarSvg width={20} height={20} fill={palette.gray} />}
              rules={buildRules(variable)}
            />
          );
        }

        const { keyboardType, startIcon } = getFieldConfig(variable);

        return (
          <FormField
            key={variable.id ?? variable.name}
            control={control}
            name={variable.name}
            label={`${variable.description} *`}
            placeholder={variable.description}
            keyboardType={keyboardType}
            startIcon={startIcon}
            rules={buildRules(variable)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingTop: 8,
  },
});
