import { axiosClient } from './axiosClient';

export const personalDataApi = {
  getPersonalData({ signal } = {}) {
    return axiosClient.get('/personal-data', { signal });
  },
};
