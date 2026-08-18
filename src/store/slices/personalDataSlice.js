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
  hasSignature: false,
  isPhoneVerified: false,
  hasNotificationAddress: false,
  lastVerifiedPhoneNumber: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const fetchPersonalData = createAsyncThunk(
  'personalData/fetch',
  async (_, { rejectWithValue, signal }) => {
    try {
      const response = await personalDataApi.getPersonalData({ signal });
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
    setUserFlags: (state, action) => {
      const { hasSignature, isPhoneVerified, hasNotificationAddress } =
        action.payload ?? {};
      if (typeof hasSignature === 'boolean') {
        state.hasSignature = hasSignature;
      }
      if (typeof isPhoneVerified === 'boolean') {
        state.isPhoneVerified = isPhoneVerified;
        if (!isPhoneVerified) {
          state.lastVerifiedPhoneNumber = null;
        }
      }
      if (typeof hasNotificationAddress === 'boolean') {
        state.hasNotificationAddress = hasNotificationAddress;
      }
    },
    setHasSignature: (state, action) => {
      state.hasSignature = Boolean(action.payload);
    },
    setPhoneVerified: (state, action) => {
      state.isPhoneVerified = true;
      if (typeof action.payload === 'string') {
        state.lastVerifiedPhoneNumber = action.payload;
      }
    },
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
        // Merge submitted payload first so UI/document generation see the
        // latest values even when the API response is partial/empty.
        const submittedPayload =
          action.meta.arg && typeof action.meta.arg === 'object'
            ? action.meta.arg
            : {};
        const apiData =
          action.payload && typeof action.payload === 'object'
            ? action.payload
            : {};

        state.data = {
          ...(state.data ?? {}),
          ...submittedPayload,
          ...apiData,
        };
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

export const {
  resetPersonalData,
  setUserFlags,
  setHasSignature,
  setPhoneVerified,
} = personalDataSlice.actions;

export const selectPersonalData = state => state.personalData.data;
export const selectPersonalDataStatus = state => state.personalData.status;
export const selectPersonalDataError = state => state.personalData.error;
export const selectHasSignature = state => state.personalData.hasSignature;
export const selectIsPhoneVerified = state => state.personalData.isPhoneVerified;
export const selectHasNotificationAddress = state =>
  state.personalData.hasNotificationAddress;
export const selectLastVerifiedPhoneNumber = state =>
  state.personalData.lastVerifiedPhoneNumber;

export default personalDataSlice.reducer;
