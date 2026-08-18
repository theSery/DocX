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

  sendPhoneOtp({ phoneNumber, purpose }) {
    return axiosClient.post('/auth/phone/send-otp', { phoneNumber, purpose });
  },

  verifyOtp({ email, phoneNumber, code, purpose }) {
    return axiosClient.post('/auth/verify-otp', {
      ...(email ? { email } : {}),
      ...(phoneNumber ? { phoneNumber } : {}),
      code,
      purpose,
    });
  },

  verifyPhoneOtp({ phoneNumber, purpose, code }) {
    return axiosClient.post('/auth/phone/verify-otp', {
      phoneNumber,
      purpose,
      code,
    });
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

  registerPersonalWithPhone({
    phoneNumber,
    name,
    surname,
    patronymic,
    password,
    pinCode,
  }) {
    return axiosClient.post('/auth/phone/register/personal', {
      phoneNumber,
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

  resetPasswordWithPhone({ phoneNumber, newPassword }) {
    return axiosClient.put('/auth/phone/reset-password', {
      phoneNumber,
      newPassword,
    });
  },
};
