import { axiosClient } from './axiosClient';

export const complaintsApi = {
  getComplaints({ page = 1, limit = 10, signal } = {}) {
    return axiosClient.get('/complaints', {
      params: { page, limit },
      signal,
    });
  },
};
