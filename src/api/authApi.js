import { axiosClient } from './axiosClient';

export const authApi = {
  login({ email, password }) {
    return axiosClient.post('/auth/login', { email, password });
  },

  sendOtp({ email, purpose }) {
    return axiosClient.post('/auth/send-otp', { email, purpose });
  },

  verifyOtp({ email, code, purpose }) {
    return axiosClient.post('/auth/verify-otp', { email, code, purpose });
  },
};
