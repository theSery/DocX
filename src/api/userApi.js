import { axiosClient } from './axiosClient';

export const userApi = {
  getMe() {
    return axiosClient.get('/user/me');
  },
  getVariables() {
    return axiosClient.get('/variables');
  },
};
