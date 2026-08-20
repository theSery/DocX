import { axiosClient } from './axiosClient';

export const LEGAL_DOCUMENT_TYPE = {
  privacyPolicy: 'privacy_policy',
  termsOfUse: 'terms_of_use',
};

export const legalDocumentsApi = {
  getByType(type) {
    return axiosClient.get(`/legal-documents/type/${type}`);
  },
};
