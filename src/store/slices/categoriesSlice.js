import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { categoriesApi } from '../../api';
import { normalizeApiError } from '../../api/axiosClient';

function parseCategoryHierarchyResponse(data, page, limit) {
  const payload = data?.data ?? data;
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.results)
        ? payload.results
        : [];

  const total = data?.meta?.total ?? data?.total ?? payload?.total ?? null;

  return {
    items,
    page,
    limit,
    total,
    hasMore: total != null ? page * limit < total : items.length === limit,
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
    limit: 10,
    total: null,
    hasMore: false,
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const fetchCategoryHierarchy = createAsyncThunk(
  'categories/fetchHierarchy',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue, signal }) => {
    try {
      const response = await categoriesApi.getCategoryHierarchy({
        page,
        limit,
        signal,
      });

      return parseCategoryHierarchyResponse(response.data, page, limit);
    } catch (error) {
      console.log('error:', error);
      return rejectWithValue(toSerializableApiError(error));
    }
  },
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    resetCategories: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCategoryHierarchy.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategoryHierarchy.fulfilled, (state, action) => {
        const { items, page, limit, total, hasMore } = action.payload;

        state.items = items;
        state.pagination = { page, limit, total, hasMore };
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchCategoryHierarchy.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || {
          type: 'unknown',
          message: action.error?.message || 'Failed to load categories',
        };
      });
  },
});

export const { resetCategories } = categoriesSlice.actions;

export const selectCategories = state => state.categories.items;
export const selectCategoriesStatus = state => state.categories.status;
export const selectCategoriesError = state => state.categories.error;
export const selectCategoriesPagination = state => state.categories.pagination;

export default categoriesSlice.reducer;
