import { createSlice } from '@reduxjs/toolkit';
import { isDateDataType } from '../../utils/variableDataTypes';

const initialState = {
  variableValues: {},
  variableDataTypes: {},
  attachedDocuments: [],
  formAttachedDocuments: [],
  past: [],
  text2: [],
  articles: [],
  formOptions: [],
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
  if (isDateDataType(dataType)) {
    return toSerializableDate(value);
  }

  return value ?? '';
}

function collectSelectedFacts(templateFactGroups, selectedFacts, radioFacts) {
  const facts = [];

  templateFactGroups.forEach(group => {
    const groupId = group?.id;

    const rawSelected = selectedFacts?.[groupId];
    const selectedIds = Array.isArray(rawSelected)
      ? rawSelected
      : rawSelected != null
        ? [rawSelected]
        : [];

    group?.facts?.forEach(fact => {
      if (selectedIds.includes(fact.id)) {
        facts.push(fact);
      }
    });

    group?.radioFactGroups?.forEach((radioGroup, radioIndex) => {
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

function selectedIdsFromMap(selectionMap, groupId) {
  const rawSelected = selectionMap?.[groupId];

  if (Array.isArray(rawSelected)) {
    return rawSelected;
  }

  return rawSelected != null ? [rawSelected] : [];
}

function collectSelectedOptions(optionGroups, selectedOptions, radioOptions) {
  const options = [];

  optionGroups.forEach((group, index) => {
    const groupId = group?.id ?? index;

    if (group?.type === 'checkbox') {
      const selectedIds = selectedIdsFromMap(selectedOptions, groupId);

      group?.options?.forEach(option => {
        if (selectedIds.includes(option.id)) {
          options.push(option);
        }
      });
      return;
    }

    if (group?.type === 'radio') {
      const selectedId = radioOptions?.[groupId];

      if (selectedId == null) {
        return;
      }

      const option = group?.options?.find(item => item.id === selectedId);

      if (option) {
        options.push(option);
      }
    }
  });

  return options;
}

function getAttachedDocumentName(document) {
  if (typeof document === 'string') {
    return document.trim();
  }

  const nestedName = document?.attachedDocument?.name;
  const name = typeof nestedName === 'string' ? nestedName : document?.name;

  return typeof name === 'string' ? name.trim() : '';
}

function getAttachedDocumentUploadable(document) {
  if (typeof document?.uploadable === 'boolean') {
    return document.uploadable;
  }

  if (typeof document?.attachedDocument?.uploadable === 'boolean') {
    return document.attachedDocument.uploadable;
  }

  return false;
}

function getAttachedDocumentId(document) {
  const id =
    document?.attachedDocument?.id ??
    document?.attachedDocumentId ??
    document?.id;

  return id == null || id === '' ? undefined : id;
}

function uniqueAttachedDocuments(documents = []) {
  const attachedDocuments = [];
  const seen = new Set();

  documents.forEach(document => {
    const name = getAttachedDocumentName(document);

    if (!name) {
      return;
    }

    const id = getAttachedDocumentId(document);
    const key = id != null ? `id:${String(id)}` : `name:${name}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    attachedDocuments.push({
      id,
      name,
      uploadable: getAttachedDocumentUploadable(document),
    });
  });

  return attachedDocuments;
}

function collectVariableAttachedDocuments(variables = []) {
  return uniqueAttachedDocuments(
    variables.flatMap(variable => variable?.attachedDocuments ?? []),
  );
}

function collectFormAttachedDocuments({
  solutionAttachments = [],
  selectedOptions = [],
  variables = [],
} = {}) {
  const optionAttachedDocuments = selectedOptions.flatMap(
    option => option?.attachedDocuments ?? [],
  );
  const variableAttachedDocuments = variables.flatMap(
    variable => variable?.attachedDocuments ?? [],
  );

  return uniqueAttachedDocuments([
    ...solutionAttachments,
    ...optionAttachedDocuments,
    ...variableAttachedDocuments,
  ]);
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
        state.attachedDocuments = action.payload.attachedDocuments;
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
            attachedDocuments: collectVariableAttachedDocuments(variables),
          },
        };
      },
    },
    syncOptionSelections: (state, action) => {
      const {
        optionGroups = [],
        selectedOptions = {},
        radioOptions = {},
        solutionAttachments = [],
        variables = [],
      } = action.payload;
      const selectedOptionItems = collectSelectedOptions(
        optionGroups,
        selectedOptions,
        radioOptions,
      );

      state.formOptions = selectedOptionItems;
      state.formAttachedDocuments = collectFormAttachedDocuments({
        solutionAttachments,
        selectedOptions: selectedOptionItems,
        variables,
      });
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

export const {
  syncVariableValues,
  syncOptionSelections,
  syncFactSelections,
  resetDocumentFill,
} = documentFillSlice.actions;

export const selectDocumentFill = state => state.documentFill;

export const selectFormAttachedDocuments = state =>
  state.documentFill.formAttachedDocuments;

export default documentFillSlice.reducer;
