import { axiosClient } from './axiosClient';

export const categoriesApi = {
  getCategoryHierarchy({ page = 1, limit = 10, signal } = {}) {
    return axiosClient.get('/category-hierarchy', {
      params: { page, limit },
      signal,
    });
  },
};
