import { axiosClient } from './axiosClient';

export const smsApi = {
  requestCode({ phoneNumber }) {
    return axiosClient.post('/sms/request-code', { phoneNumber });
  },

  verifyCode({ phoneNumber, code }) {
    return axiosClient.post('/sms/verify-code', { phoneNumber, code });
  },
};
