import { axiosClient } from './axiosClient';

export const personalDocumentsApi = {
  getPersonalDocuments({ page = 1, limit = 10, searchTerm, signal } = {}) {
    const params = { page, limit };

    if (searchTerm) {
      params.searchTerm = searchTerm;
    }

    return axiosClient.get('/personal-documents', {
      params,
      signal,
    });
  },
};
