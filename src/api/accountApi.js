import { axiosClient } from './axiosClient';

export const accountApi = {
  getDeletionPreview() {
    return axiosClient.get('/account/deletion-preview');
  },

  requestDeletionCode() {
    return axiosClient.post('/account/deletion/request-code');
  },

  deleteAccount({ code }) {
    return axiosClient.delete('/account', { data: { code } });
  },
};
