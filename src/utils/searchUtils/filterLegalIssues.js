export function filterLegalIssues(flattened, query) {
  const normalizedQuery = query.trim().toLowerCase();
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
