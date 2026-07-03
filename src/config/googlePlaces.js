export const GOOGLE_PLACES_TEST_KEY = 'test';

const PLACEHOLDER_KEYS = new Set([
  GOOGLE_PLACES_TEST_KEY,
  'your-google-places-api-key',
  '',
]);

export function isGooglePlacesTestKey(key) {
  return PLACEHOLDER_KEYS.has(key?.trim() ?? '');
}

export const TEST_ARMENIAN_ADDRESSES = [
  'Երևան, Աբովյան 1',
  'Երևան, Ամիրյան 15',
  'Երևան, Կոմիտաս 49',
  'Երևան, Մաշտոցի 40',
  'Երևան, Բաղրամյան 24',
  'Գյումրի, Աբովյան 25',
  'Վանաձոր, Հայկական Լեգիոն',
  'Աշտարակ, Ներքին Շրջան',
  'Դիլիջան, Մյասնիկյան',
  'Արմավիր, Մեծամոր',
  'Կոտայք, Հրազդան',
  'Սևան, Ծաթեր',
];

export function filterTestAddresses(query, addresses = TEST_ARMENIAN_ADDRESSES) {
  const normalized = query?.trim().toLowerCase() ?? '';
  if (normalized.length < 2) {
    return [];
  }

  return addresses.filter((address) => address.toLowerCase().includes(normalized));
}
