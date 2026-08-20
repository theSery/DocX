import { axiosClient } from './axiosClient';

export const signatureApi = {
  getSignature() {
    return axiosClient.get('/signature');
  },

  uploadSignature({ uri, name = 'signature.png', type = 'image/png' }) {
    const formData = new FormData();
    formData.append('file', { uri, name, type });

    return axiosClient.post('/signature', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateSignature({ uri, name = 'signature.png', type = 'image/png' }) {
    const formData = new FormData();
    formData.append('file', { uri, name, type });
console.log('formData', formData);
    return axiosClient.put('/signature', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteSignature() {
    return axiosClient.delete('/signature');
  },
};
