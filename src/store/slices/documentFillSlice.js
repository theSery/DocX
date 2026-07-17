import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  variableValues: {},
  variableDataTypes: {},
  past: [],
  text2: [],
  articles: [],
};

function toSerializableDate(value) {
  if (value == null) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return null;
}

function serializeVariableValue(value, dataType) {
  if (dataType === 'date') {
    return toSerializableDate(value);
  }

  return value ?? '';
}

function collectSelectedFacts(templateFactGroups, selectedFacts, radioFacts) {
  const facts = [];

  templateFactGroups.forEach(group => {
    const factGroup = group.factGroup;
    const groupId = factGroup?.id;

    const rawSelected = selectedFacts?.[groupId];
    const selectedIds = Array.isArray(rawSelected)
      ? rawSelected
      : rawSelected != null
        ? [rawSelected]
        : [];

    factGroup?.factGroupFacts?.forEach(({ fact }) => {
      if (selectedIds.includes(fact.id)) {
        facts.push(fact);
      }
    });

    factGroup?.radioFactGroups?.forEach((radioGroup, radioIndex) => {
      const groupKey = radioGroup.id ?? radioIndex;
      const selectedId = radioFacts?.[groupKey];

      if (selectedId == null) {
        return;
      }

      const fact = radioGroup.facts?.find(item => item.id === selectedId);

      if (fact) {
        facts.push(fact);
      }
    });
  });

  return facts;
}

function buildFactArrays(facts) {
  return {
    past: facts.map(fact => fact.factualText).filter(Boolean),
    text2: facts.map(fact => fact.analyticalText).filter(Boolean),
    articles: facts.flatMap(fact =>
      (fact.articles ?? []).map(article => article.articleText).filter(Boolean),
    ),
  };
}

const documentFillSlice = createSlice({
  name: 'documentFill',
  initialState,
  reducers: {
    syncVariableValues: {
      reducer: (state, action) => {
        state.variableValues = action.payload.variableValues;
        state.variableDataTypes = action.payload.variableDataTypes;
      },
      prepare: ({ variables = [], values = {} }) => {
        const variableValues = {};
        const variableDataTypes = {};

        variables.forEach(variable => {
          if (!variable?.name) {
            return;
          }

          variableValues[variable.name] = serializeVariableValue(
            values?.[variable.name],
            variable.dataType,
          );
          variableDataTypes[variable.name] = variable.dataType;
        });

        return {
          payload: {
            variableValues,
            variableDataTypes,
          },
        };
      },
    },
    syncFactSelections: (state, action) => {
      const { templateFactGroups = [], selectedFacts = {}, radioFacts = {} } =
        action.payload;
      const selectedFactObjects = collectSelectedFacts(
        templateFactGroups,
        selectedFacts,
        radioFacts,
      );
      const { past, text2, articles } = buildFactArrays(selectedFactObjects);

      state.past = past;
      state.text2 = text2;
      state.articles = articles;
    },
    resetDocumentFill: () => initialState,
  },
});

export const { syncVariableValues, syncFactSelections, resetDocumentFill } =
  documentFillSlice.actions;

export const selectDocumentFill = state => state.documentFill;

export default documentFillSlice.reducer;
