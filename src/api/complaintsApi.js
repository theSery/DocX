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

  deleteComplaint(id) {
    return axiosClient.delete(`/complaints/${id}`);
  },

  getComplaint(id) {
    return axiosClient.get(`/complaints/${id}`);
  },

  sendComplaint(id, { recipientType, recipientEmail, addresseeEmail, attachedDocuments }) {
    return axiosClient.post(`/complaints/${id}/send`, {
      recipientType,
      recipientEmail,
      addresseeEmail,
      attachedDocuments,
    });
  },

  createComplaint({ templateId, documentName, serialNumber, data, file }) {
    const formData = new FormData();

    formData.append('templateId', String(templateId));
    formData.append('documentName', documentName);
    formData.append('serialNumber', serialNumber);
    formData.append('data', data);

    if (file?.uri) {
      const uri = file.uri.startsWith('file://') ? file.uri : `file://${file.uri}`;

      formData.append('file', {
        uri,
        name: file.name,
        type: file.type ?? 'application/pdf',
      });
    }
console.log('formData:', formData);
    return axiosClient.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
