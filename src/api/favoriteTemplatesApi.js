import { axiosClient } from './axiosClient';

export const favoriteTemplatesApi = {
  getFavoriteTemplateIds({ signal } = {}) {
    return axiosClient.get('/favorite-templates/ids', { signal });
  },

  addFavoriteTemplate({ templateId }) {
    return axiosClient.post('/favorite-templates', { templateId });
  },

  removeFavoriteTemplate({ templateId }) {
    return axiosClient.delete(`/favorite-templates/${templateId}`);
  },
};
