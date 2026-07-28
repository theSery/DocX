import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import { FormDateField, FormField } from '../../../../../components';
import CalendarSvg from '../../../../../components/icons/CalendarSvg';
import ActNumberSvg from '../../../../../components/icons/ActNumberSvg';
import UserSvg from '../../../../../components/icons/UserSvg';
import { useTheme } from '../../../../../hooks';
import { ARMENIAN_NAME_RULES } from '../../../../../utils/patterns';
import {
  addDays,
  getDayOffset,
  isDateDataType,
} from '../../../../../utils/variableDataTypes';
import { useAppDispatch } from '../../../../../store';
import { syncVariableValues } from '../../../../../store/slices/documentFillSlice';

const ACT_DATE_FIELD = 'Act_date';
const ACT_RECEIVE_DATE_FIELD = 'Act_resive_day';

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildRules(variable, { actDateField, receiveDateField } = {}) {
  const requiredMessage = `${variable.description} դաշտը պարտադիր է`;
  const dayOffset = getDayOffset(variable.dataType);

  if (dayOffset != null) {
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
        notBeforeLookback: value => {
          if (!(value instanceof Date)) {
            return true;
          }
          const minimumDate = addDays(new Date(), -dayOffset);
          return (
            startOfDay(value) >= startOfDay(minimumDate) ||
            `${variable.description} դաշտը չի կարող վաղ լինել վերջին ${dayOffset} օրից`
          );
        },
      },
    };
  }

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
          if (!receiveDateField || variable.name !== receiveDateField) {
            return true;
          }
          const actDate = actDateField ? formValues?.[actDateField] : null;
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
      ...(actDateField &&
      receiveDateField &&
      variable.name === actDateField
        ? { deps: [receiveDateField] }
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

function getFieldConfig(variable, iconColor) {
  if (variable.dataType === 'digit') {
    return {
      keyboardType: 'numeric',
      startIcon: <ActNumberSvg width={17} height={19} fill={iconColor} />,
    };
  }

  if (variable.dataType === 'armenian') {
    return {
      keyboardType: 'default',
      startIcon: <UserSvg width={24} height={24} fill={iconColor} />,
    };
  }

  return {
    keyboardType: 'default',
    startIcon: null,
  };
}

function resolveLinkedDateFields(variables = []) {
  const names = new Set(variables.map(variable => variable?.name).filter(Boolean));
  const actDateField = names.has(ACT_DATE_FIELD) ? ACT_DATE_FIELD : null;
  const receiveDateField = names.has(ACT_RECEIVE_DATE_FIELD)
    ? ACT_RECEIVE_DATE_FIELD
    : null;

  return { actDateField, receiveDateField };
}

export function FillAct({ control, variables = [] }) {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const variableValues = useWatch({ control });
  const linkedDateFields = useMemo(
    () => resolveLinkedDateFields(variables),
    [variables],
  );

  useEffect(() => {
    dispatch(syncVariableValues({ variables, values: variableValues }));
  }, [dispatch, variableValues, variables]);

  return (
    <View style={styles.container}>
      {variables.map(variable => {
        if (isDateDataType(variable.dataType)) {
          const dayOffset = getDayOffset(variable.dataType);
          const today = new Date();
          const minimumDate =
            dayOffset != null ? addDays(today, -dayOffset) : undefined;
          const maximumDate =
            variable.dataType === 'date' || dayOffset != null ? today : undefined;

          return (
            <FormDateField
              key={variable.id ?? variable.name}
              control={control}
              name={variable.name}
              label={`${variable.description} *`}
              startIcon={<CalendarSvg width={20} height={20} fill={colors.icons} />}
              rules={buildRules(variable, linkedDateFields)}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          );
        }

        const { keyboardType, startIcon } = getFieldConfig(variable, colors.icons);

        return (
          <FormField
            key={variable.id ?? variable.name}
            control={control}
            name={variable.name}
            label={`${variable.description} *`}
            placeholder={variable.description}
            keyboardType={keyboardType}
            startIcon={startIcon}
            rules={buildRules(variable, linkedDateFields)}
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
