import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { favoriteTemplatesApi } from '../../api';
import { normalizeApiError } from '../../api/axiosClient';
import { parseFavoriteTemplateIds } from '../utils/applyFavoriteFlags';

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
  ids: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const fetchFavoriteTemplateIds = createAsyncThunk(
  'favoriteTemplates/fetchIds',
  async ({ signal } = {}, { rejectWithValue }) => {
    try {
      const response = await favoriteTemplatesApi.getFavoriteTemplateIds({
        signal,
      });

      return parseFavoriteTemplateIds(response.data);
    } catch (error) {
      return rejectWithValue(toSerializableApiError(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = getState().favoriteTemplates;
      return status === 'idle' || status === 'failed';
    },
  },
);

export const addFavoriteTemplate = createAsyncThunk(
  'favoriteTemplates/add',
  async ({ templateId }, { getState, rejectWithValue }) => {
    const id = Number(templateId);

    if (getState().favoriteTemplates.ids.some(existing => Number(existing) === id)) {
      return id;
    }

    try {
      await favoriteTemplatesApi.addFavoriteTemplate({ templateId: id });
      return id;
    } catch (error) {
      return rejectWithValue(toSerializableApiError(error));
    }
  },
);

export const removeFavoriteTemplate = createAsyncThunk(
  'favoriteTemplates/remove',
  async ({ templateId }, { rejectWithValue }) => {
    const id = Number(templateId);

    try {
      await favoriteTemplatesApi.removeFavoriteTemplate({ templateId: id });
      return id;
    } catch (error) {
      return rejectWithValue(toSerializableApiError(error));
    }
  },
);

const favoriteTemplatesSlice = createSlice({
  name: 'favoriteTemplates',
  initialState,
  reducers: {
    resetFavoriteTemplates: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFavoriteTemplateIds.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFavoriteTemplateIds.fulfilled, (state, action) => {
        state.ids = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchFavoriteTemplateIds.rejected, (state, action) => {
        if (action.payload?.type === 'cancel') {
          if (state.status === 'loading') {
            state.status = state.ids.length > 0 ? 'succeeded' : 'idle';
          }
          return;
        }

        state.status = 'failed';
        state.error = action.payload || {
          type: 'unknown',
          message: action.error?.message || 'Failed to load favorite templates',
        };
      })
      .addCase(addFavoriteTemplate.fulfilled, (state, action) => {
        const id = Number(action.payload);
        if (!state.ids.some(existing => Number(existing) === id)) {
          state.ids.push(id);
        }
      })
      .addCase(removeFavoriteTemplate.fulfilled, (state, action) => {
        const id = Number(action.payload);
        state.ids = state.ids.filter(existing => Number(existing) !== id);
      });
  },
});

export const { resetFavoriteTemplates } = favoriteTemplatesSlice.actions;

export const selectFavoriteTemplateIds = state => state.favoriteTemplates.ids;
export const selectFavoriteTemplatesStatus = state =>
  state.favoriteTemplates.status;
export const selectFavoriteTemplatesError = state =>
  state.favoriteTemplates.error;
export const selectIsFavoriteTemplate = (state, templateId) =>
  state.favoriteTemplates.ids.some(
    id => Number(id) === Number(templateId),
  );

export default favoriteTemplatesSlice.reducer;
