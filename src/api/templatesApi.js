import { axiosClient } from './axiosClient';

export const templatesApi = {
  getTemplateById(id, { signal } = {}) {
    return axiosClient.get(`/templates/${id}`, { signal });
  },
};
