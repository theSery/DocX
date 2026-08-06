import { axiosClient } from './axiosClient';

export const accountApi = {
  requestDeletionCode() {
    return axiosClient.post('/account/deletion/request-code');
  },

  deleteAccount({ code }) {
    return axiosClient.delete('/account', { data: { code } });
  },
};
