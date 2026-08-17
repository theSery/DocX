import { LEGAL_DOCUMENT_TYPE, legalDocumentsApi } from './legalDocumentsApi';

export const termsOfUseApi = {
  getTermsOfUse() {
    return legalDocumentsApi.getByType(LEGAL_DOCUMENT_TYPE.termsOfUse);
  },
};
