import { normalizeSearchText } from '../armenianTransliteration';

export function filterLegalIssues(flattened, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  const matches = [];

  for (const entry of flattened) {
    if (entry.normalizedName.includes(normalizedQuery)) {
      matches.push(entry);
    }
  }

  return matches;
}
