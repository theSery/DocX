import { axiosClient } from './axiosClient';

export const privacyPolicyApi = {
  getPrivacyPolicy() {
    return axiosClient.get('/privacy-policy');
  },
};
