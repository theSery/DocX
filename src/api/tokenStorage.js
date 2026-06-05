import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/storageKeys';

let cachedToken = null;

export async function getAccessToken() {
  if (cachedToken) {
    return cachedToken;
  }

  cachedToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  return cachedToken;
}

export async function setAccessToken(token) {
  cachedToken = token;
  await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
}

export async function clearAccessToken() {
  cachedToken = null;
  await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export async function persistAuthResponse(response) {
  const accessToken = response?.data?.accessToken;
  if (accessToken) {
    await setAccessToken(accessToken);
  }
}
