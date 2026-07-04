export function groupSearchResultsByCategory(matches) {
  const groups = new Map();

  for (const entry of matches) {
    const groupKey = entry.category.id ?? entry.category.name;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        id: groupKey,
        name: entry.category.name,
        iconUrl: entry.category.iconUrl,
        category: entry.category,
        results: [],
      });
    }

    groups.get(groupKey).results.push(entry);
  }

  return Array.from(groups.values());
}
