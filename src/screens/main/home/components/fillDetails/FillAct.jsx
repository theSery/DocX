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
import { syncVariableValues } from '../../../../../store/slices/documentFillSlice';

const ACT_DATE_FIELD = 'Act_date';
const ACT_RECEIVE_DATE_FIELD = 'Act_resive_day';

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildRules(variable) {
  const requiredMessage = `${variable.description} դաշտը պարտադիր է`;

  if (variable.dataType === 'date') {
    return {
      required: requiredMessage,
      validate: {
        isDate: value => value instanceof Date || requiredMessage,
        notInFuture: value => {
          if (!(value instanceof Date)) {
            return true;
          }
          return (
            startOfDay(value) <= startOfDay(new Date()) ||
            `${variable.description} դաշտը չի կարող լինել այսօրվանից ուշ`
          );
        },
        notBeforeActDate: (value, formValues) => {
          if (variable.name !== ACT_RECEIVE_DATE_FIELD) {
            return true;
          }
          const actDate = formValues?.[ACT_DATE_FIELD];
          if (!(value instanceof Date) || !(actDate instanceof Date)) {
            return true;
          }
          return (
            startOfDay(value) >= startOfDay(actDate) ||
            'Որոշումը ստանալու օրը չի կարող վաղ լինել որոշման ամսաթվից'
          );
        },
      },
      // Re-validate the receive date when the act date changes
      ...(variable.name === ACT_DATE_FIELD
        ? { deps: [ACT_RECEIVE_DATE_FIELD] }
        : {}),
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
  const variableValues = useWatch({ control });

  useEffect(() => {
    dispatch(syncVariableValues({ variables, values: variableValues }));
  }, [dispatch, variableValues, variables]);

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
              maximumDate={new Date()}
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
