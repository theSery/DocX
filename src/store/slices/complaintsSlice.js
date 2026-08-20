import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { complaintsApi } from '../../api';
import { normalizeApiError } from '../../api/axiosClient';

const DEFAULT_LIMIT = 10;

function parseComplaintsResponse(data, page, limit, filters = {}) {
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
    filters: {
      searchTerm: filters.searchTerm || '',
      recipientType: filters.recipientType || 'all',
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
    },
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
  filters: {
    searchTerm: '',
    recipientType: 'all',
    startDate: '',
    endDate: '',
  },
  status: 'idle', // 'idle' | 'loading' | 'loadingMore' | 'succeeded' | 'failed'
  isFetching: false,
  error: null,
};

export const fetchComplaints = createAsyncThunk(
  'complaints/fetch',
  async (
    {
      page = 1,
      limit = DEFAULT_LIMIT,
      searchTerm = '',
      recipientType = 'all',
      startDate = '',
      endDate = '',
      append = false,
    } = {},
    { rejectWithValue, signal },
  ) => {
    try {
      const response = await complaintsApi.getComplaints({
        page,
        limit,
        ...(recipientType && recipientType !== 'all'
          ? { recipientType }
          : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(searchTerm ? { searchTerm } : {}),
        signal,
      });

      return {
        ...parseComplaintsResponse(response.data, page, limit, {
          searchTerm,
          recipientType,
          startDate,
          endDate,
        }),
        append,
      };
    } catch (error) {
      return rejectWithValue(toSerializableApiError(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { isFetching } = getState().complaints;
      return !isFetching;
    },
  },
);

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    resetComplaints: () => initialState,
    removeComplaint: (state, action) => {
      const deletedId = String(action.payload);
      state.items = state.items.filter(item => String(item.id) !== deletedId);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchComplaints.pending, (state, action) => {
        const append = Boolean(action.meta.arg?.append);
        state.isFetching = true;
        state.error = null;

        if (append) {
          state.status = 'loadingMore';
        } else if (state.items.length === 0) {
          state.status = 'loading';
        }
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        const { items, page, limit, total, lastPage, filters, append } =
          action.payload;

        state.items = append ? [...state.items, ...items] : items;
        state.pagination = { page, limit, total, lastPage };
        state.filters = filters;
        state.status = 'succeeded';
        state.isFetching = false;
        state.error = null;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
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
            action.error?.message || 'Չհաջողվեց բեռնել փաստաթղթերը',
        };
      });
  },
});

export const { resetComplaints, removeComplaint } = complaintsSlice.actions;

export const selectComplaints = state => state.complaints.items;
export const selectComplaintsStatus = state => state.complaints.status;
export const selectComplaintsError = state => state.complaints.error;
export const selectComplaintsPagination = state => state.complaints.pagination;
export const selectComplaintsFilters = state => state.complaints.filters;
export const selectComplaintsIsFetching = state => state.complaints.isFetching;

export default complaintsSlice.reducer;
