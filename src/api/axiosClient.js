import axios from 'axios';
import { ENV } from '../config';
import { getAccessToken } from './tokenStorage';

export const axiosClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  async config => {
    const token = await getAccessToken();
    console.log('token', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  response => response,
  error => Promise.reject(normalizeApiError(error)),
);

export function normalizeApiError(error) {
  if (axios.isCancel(error)) {
    return { type: 'cancel', message: 'Request was cancelled', original: error };
  }

  if (error.response) {
    const { status, data } = error.response;
    return {
      type: 'http',
      status,
      message:
        (data && (data.message || data.error)) ||
        `Request failed with status ${status}`,
      data,
      original: error,
    };
  }

  if (error.request) {
    return {
      type: 'network',
      message: 'Network error. Please check your connection.',
      original: error,
    };
  }

  return {
    type: 'unknown',
    message: error.message || 'Unexpected error',
    original: error,
  };
}
