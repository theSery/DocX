import { API_BASE_URL, API_TIMEOUT_MS, GOOGLE_PLACES_API_KEY } from '@env';

function required(value, name) {
  if (value === undefined || value === null || value === '') {
    throw new Error(
      `[env] Missing required environment variable: ${name}. ` +
        'Add it to your .env file and reset the Metro cache (npm run start:reset).',
    );
  }
  return value;
}

export const ENV = {
  API_BASE_URL: required(API_BASE_URL, 'API_BASE_URL'),
  API_TIMEOUT_MS: Number(API_TIMEOUT_MS) || 15000,
  GOOGLE_PLACES_API_KEY: required(GOOGLE_PLACES_API_KEY, 'GOOGLE_PLACES_API_KEY'),
};
