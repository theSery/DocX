import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import categoriesReducer from './slices/categoriesSlice';

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Dev-only guard; large API payloads can exceed the default 32ms threshold.
        warnAfter: 128,
        // createAsyncThunk passes AbortSignal in the action arg.
        ignoredActionPaths: ['meta.arg.signal'],
      },
      immutableCheck: {
        warnAfter: 128,
      },
    }),
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
