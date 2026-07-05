import * as Keychain from 'react-native-keychain';

const TOKEN_KEYCHAIN_SERVICE = 'com.docx.authTokens';

let cachedAccessToken = null;
let cachedRefreshToken = null;

function buildTokenOptions() {
  return {
    service: TOKEN_KEYCHAIN_SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
}

async function loadTokensFromStorage() {
  const credentials = await Keychain.getGenericPassword({
    service: TOKEN_KEYCHAIN_SERVICE,
  });

  if (!credentials) {
    return { accessToken: null, refreshToken: null };
  }

  try {
    const { accessToken, refreshToken } = JSON.parse(credentials.password);
    return {
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

async function ensureCacheHydrated() {
  if (cachedAccessToken !== null || cachedRefreshToken !== null) {
    return;
  }

  const stored = await loadTokensFromStorage();
  cachedAccessToken = stored.accessToken;
  cachedRefreshToken = stored.refreshToken;
}

export async function getAccessToken() {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  const { accessToken } = await loadTokensFromStorage();
  cachedAccessToken = accessToken;
  return accessToken;
}

export async function getRefreshToken() {
  if (cachedRefreshToken) {
    return cachedRefreshToken;
  }

  const { refreshToken } = await loadTokensFromStorage();
  cachedRefreshToken = refreshToken;
  return refreshToken;
}

export async function setAuthTokens({ accessToken, refreshToken }) {
  if (accessToken === undefined && refreshToken === undefined) {
    return;
  }

  await ensureCacheHydrated();

  if (accessToken !== undefined) {
    cachedAccessToken = accessToken;
  }

  if (refreshToken !== undefined) {
    cachedRefreshToken = refreshToken;
  }

  const payload = JSON.stringify({
    accessToken: cachedAccessToken,
    refreshToken: cachedRefreshToken,
  });

  await Keychain.setGenericPassword('tokens', payload, buildTokenOptions());
}

export async function setAccessToken(token) {
  await setAuthTokens({ accessToken: token });
}

export async function clearAuthTokens() {
  cachedAccessToken = null;
  cachedRefreshToken = null;
  await Keychain.resetGenericPassword({ service: TOKEN_KEYCHAIN_SERVICE });
}

export async function clearAccessToken() {
  await clearAuthTokens();
}

export async function persistAuthResponse(response) {
  const payload = response?.data?.data ?? response?.data;
  const accessToken = payload?.accessToken;
  const refreshToken = payload?.refreshToken;
  const tokens = {};

  if (accessToken) {
    tokens.accessToken = accessToken;
  }

  if (refreshToken) {
    tokens.refreshToken = refreshToken;
  }

  if (Object.keys(tokens).length > 0) {
    await setAuthTokens(tokens);
  }
}
