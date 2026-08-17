import { LEGAL_DOCUMENT_TYPE, legalDocumentsApi } from './legalDocumentsApi';

export const privacyPolicyApi = {
  getPrivacyPolicy() {
    return legalDocumentsApi.getByType(LEGAL_DOCUMENT_TYPE.privacyPolicy);
  },
};
