import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { personalDocumentsApi } from '../../api';
import { normalizeApiError } from '../../api/axiosClient';

const DEFAULT_LIMIT = 100;

function parsePersonalDocumentsResponse(data, page, limit, searchTerm = '') {
  const payload = data ?? {};
  const items = Array.isArray(payload.data) ? payload.data : [];
  const total = payload.total ?? 0;
  const lastPage = Number(payload.lastPage) || 1;

  return {
    items,
    page,
    limit,
    total,
    lastPage,
    searchTerm: searchTerm || '',
  };
}

function toSerializableApiError(error) {
  const normalized = error?.type ? error : normalizeApiError(error);
  return {
    type: normalized.type,
    status: normalized.status,
    message: normalized.message,
    data: normalized.data,
  };
}

const initialState = {
  items: [],
  pagination: {
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    lastPage: 1,
  },
  searchTerm: '',
  status: 'idle', // 'idle' | 'loading' | 'loadingMore' | 'succeeded' | 'failed'
  isFetching: false,
  error: null,
};

export const fetchPersonalDocuments = createAsyncThunk(
  'personalDocuments/fetch',
  async (
    { page = 1, limit = DEFAULT_LIMIT, searchTerm = '', append = false } = {},
    { rejectWithValue, signal },
  ) => {
    try {
      const response = await personalDocumentsApi.getPersonalDocuments({
        page,
        limit,
        ...(searchTerm ? { searchTerm } : {}),
        signal,
      });

      return {
        ...parsePersonalDocumentsResponse(response.data, page, limit, searchTerm),
        append,
      };
    } catch (error) {
      return rejectWithValue(toSerializableApiError(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { isFetching } = getState().personalDocuments;
      return !isFetching;
    },
  },
);

const personalDocumentsSlice = createSlice({
  name: 'personalDocuments',
  initialState,
  reducers: {
    resetPersonalDocuments: () => initialState,
    removePersonalDocument: (state, action) => {
      const deletedId = String(action.payload);
      state.items = state.items.filter(item => String(item.id) !== deletedId);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPersonalDocuments.pending, (state, action) => {
        const append = Boolean(action.meta.arg?.append);
        state.isFetching = true;
        state.error = null;

        if (append) {
          state.status = 'loadingMore';
        } else if (state.items.length === 0) {
          state.status = 'loading';
        }
      })
      .addCase(fetchPersonalDocuments.fulfilled, (state, action) => {
        const { items, page, limit, total, lastPage, searchTerm, append } =
          action.payload;

        state.items = append ? [...state.items, ...items] : items;
        state.pagination = { page, limit, total, lastPage };
        state.searchTerm = searchTerm;
        state.status = 'succeeded';
        state.isFetching = false;
        state.error = null;
      })
      .addCase(fetchPersonalDocuments.rejected, (state, action) => {
        state.isFetching = false;

        if (action.payload?.type === 'cancel') {
          if (state.status === 'loading' || state.status === 'loadingMore') {
            state.status = state.items.length > 0 ? 'succeeded' : 'idle';
          }
          return;
        }

        state.status = 'failed';
        state.error = action.payload || {
          type: 'unknown',
          message:
            action.error?.message || 'Չհաջողվեց բեռնել ֆայլերը',
        };
      });
  },
});

export const { resetPersonalDocuments, removePersonalDocument } =
  personalDocumentsSlice.actions;

export const selectPersonalDocuments = state => state.personalDocuments.items;
export const selectPersonalDocumentsStatus = state =>
  state.personalDocuments.status;
export const selectPersonalDocumentsError = state =>
  state.personalDocuments.error;
export const selectPersonalDocumentsPagination = state =>
  state.personalDocuments.pagination;
export const selectPersonalDocumentsSearchTerm = state =>
  state.personalDocuments.searchTerm;
export const selectPersonalDocumentsIsFetching = state =>
  state.personalDocuments.isFetching;

export default personalDocumentsSlice.reducer;
