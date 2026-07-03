import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { personalDataApi } from '../../api';
import { normalizeApiError } from '../../api/axiosClient';

function parsePersonalDataResponse(data) {
  return data?.data ?? data ?? null;
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
  data: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const fetchPersonalData = createAsyncThunk(
  'personalData/fetch',
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await personalDataApi.getPersonalData({ signal });
      console.log('response oooo', response);
      return parsePersonalDataResponse(response.data);
    } catch (error) {
      return rejectWithValue(toSerializableApiError(error));
    }
  },
);

export const updatePersonalData = createAsyncThunk(
  'personalData/update',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await personalDataApi.updatePersonalData(payload);
      return parsePersonalDataResponse(response.data);
    } catch (error) {
      return rejectWithValue(toSerializableApiError(error));
    }
  },
);

const personalDataSlice = createSlice({
  name: 'personalData',
  initialState,
  reducers: {
    resetPersonalData: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPersonalData.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPersonalData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchPersonalData.rejected, (state, action) => {
        if (action.payload?.type === 'cancel') {
          state.status = 'idle';
          return;
        }

        state.status = 'failed';
        state.error = action.payload || {
          type: 'unknown',
          message: action.error?.message || 'Failed to load personal data',
        };
      })
      .addCase(updatePersonalData.pending, state => {
        state.error = null;
      })
      .addCase(updatePersonalData.fulfilled, (state, action) => {
        state.data = { ...state.data, ...action.payload };
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updatePersonalData.rejected, (state, action) => {
        state.error = action.payload || {
          type: 'unknown',
          message: action.error?.message || 'Failed to update personal data',
        };
      });
  },
});

export const { resetPersonalData } = personalDataSlice.actions;

export const selectPersonalData = state => state.personalData.data;
export const selectPersonalDataStatus = state => state.personalData.status;
export const selectPersonalDataError = state => state.personalData.error;

export default personalDataSlice.reducer;
