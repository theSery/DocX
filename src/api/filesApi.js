import { axiosClient } from './axiosClient';

export const filesApi = {
  uploadFile({ fileName, uri, name, type }) {
    const formData = new FormData();
    formData.append('file', { uri, name, type });
    formData.append('fileName', fileName);

    return axiosClient.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
