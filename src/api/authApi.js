import { axiosClient } from './axiosClient';

export const authApi = {
  login({ email, password }) {
    return axiosClient.post('/auth/login', { email, password });
  },

  loginWithPhone({ phoneNumber, password }) {
    return axiosClient.post('/auth/phone/login', { phoneNumber, password });
  },

  sendOtp({ email, purpose }) {
    return axiosClient.post('/auth/send-otp', { email, purpose });
  },

  verifyOtp({ email, code, purpose }) {
    console.log('verifyOtp', email, code, purpose);
    return axiosClient.post('/auth/verify-otp', { email, code, purpose });
  },

  registerPersonal({ email, name, surname, patronymic, password, pinCode }) {
    return axiosClient.post('/auth/register/personal', {
      email,
      name,
      surname,
      patronymic,
      password,
      pinCode,
    });
  },

  verifyPin({ pinCode }) {
    return axiosClient.post('/auth/verify-pin', { pinCode });
  },

  refreshToken({ refreshToken }) {
    return axiosClient.post('/auth/refresh-token', { refreshToken });
  },

  logout() {
    return axiosClient.post('/auth/logout');
  },

  changePassword({ oldPassword, newPassword }) {
    return axiosClient.put('/auth/password', { oldPassword, newPassword });
  },

  changePin({ oldPin, newPin }) {
    return axiosClient.put('/auth/pin', { oldPin, newPin });
  },

  resetPin({ email, code, newPin }) {
    return axiosClient.put('/auth/reset-pin', {
      email,
      code,
      newPin,
    });
  },

  resetPassword({ email, code, newPassword }) {
    return axiosClient.put('/auth/reset-password', {
      email,
      code,
      newPassword,
    });
  },
};
