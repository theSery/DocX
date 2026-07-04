import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from './storageKeys';

async function getRecommendedDocumentIds() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.RECOMMENDED_DOCUMENTS);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

async function saveRecommendedDocumentIds(ids) {
  await AsyncStorage.setItem(STORAGE_KEYS.RECOMMENDED_DOCUMENTS, JSON.stringify(ids));
}

export async function addRecommendedDocument(id) {
  const documentId = String(id);
  const ids = await getRecommendedDocumentIds();

  if (ids.includes(documentId)) {
    return ids;
  }

  const nextIds = [documentId, ...ids];
  await saveRecommendedDocumentIds(nextIds);
  return nextIds;
}

export async function removeRecommendedDocument(id) {
  const documentId = String(id);
  const ids = await getRecommendedDocumentIds();
  const nextIds = ids.filter(storedId => storedId !== documentId);

  if (nextIds.length === ids.length) {
    return ids;
  }

  await saveRecommendedDocumentIds(nextIds);
  return nextIds;
}

export { getRecommendedDocumentIds };
