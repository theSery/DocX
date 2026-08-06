import { axiosClient } from './axiosClient';

export const termsOfUseApi = {
  getTermsOfUse() {
    return axiosClient.get('/terms-of-use');
  },
};
