import { axiosClient } from './axiosClient';

export const personalDataApi = {
  getPersonalData({ signal } = {}) {
    return axiosClient.get('/personal-data', { signal });
  },

  updatePersonalData(payload) {
    return axiosClient.put('/personal-data', payload);
  },
};
