import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import categoriesReducer from './slices/categoriesSlice';
import complaintsReducer from './slices/complaintsSlice';
import documentFillReducer from './slices/documentFillSlice';
import personalDataReducer from './slices/personalDataSlice';
import personalDocumentsReducer from './slices/personalDocumentsSlice';

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    complaints: complaintsReducer,
    documentFill: documentFillReducer,
    personalData: personalDataReducer,
    personalDocuments: personalDocumentsReducer,
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
