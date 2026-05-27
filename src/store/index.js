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
        // Normalised axios errors are stored in state; ignore their non-serializable `original`.
        ignoredActionPaths: ['payload.original', 'meta.arg.signal'],
        ignoredPaths: ['categories.error.original'],
      },
    }),
});

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
