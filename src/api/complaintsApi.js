import { axiosClient } from './axiosClient';

export const complaintsApi = {
  getComplaints({
    page = 1,
    limit = 10,
    startDate,
    endDate,
    recipientType,
    searchTerm,
    signal,
  } = {}) {
    const params = { page, limit };

    if (startDate) {
      params.startDate = startDate;
    }

    if (endDate) {
      params.endDate = endDate;
    }

    if (recipientType) {
      params.recipientType = recipientType;
    }

    if (searchTerm) {
      params.searchTerm = searchTerm;
    }

    return axiosClient.get('/complaints', {
      params,
      signal,
    });
  },
};
