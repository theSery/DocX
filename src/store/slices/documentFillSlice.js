import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  Act_number: '',
  Act_date: null,
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
    setActNumber: (state, action) => {
      state.Act_number = action.payload ?? '';
    },
    setActDate: {
      reducer: (state, action) => {
        state.Act_date = action.payload;
      },
      prepare: value => ({
        payload: toSerializableDate(value),
      }),
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

export const { setActNumber, setActDate, syncFactSelections, resetDocumentFill } =
  documentFillSlice.actions;

export const selectDocumentFill = state => state.documentFill;

export default documentFillSlice.reducer;
