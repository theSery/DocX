function bySequence(a, b) {
  return (a?.sequence ?? 0) - (b?.sequence ?? 0);
}

export function sortBySequence(items = []) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.slice().sort(bySequence);
}

// Facts arrive either as plain objects (category hierarchy) or wrapped in a
// join row as `{ fact, sequence }` (template details endpoint).
function normalizeFactItem(item) {
  if (!item) {
    return null;
  }

  const fact = item.fact ?? item;

  if (!fact || typeof fact !== 'object') {
    return null;
  }

  return {
    ...fact,
    sequence: item.sequence ?? fact.sequence ?? 0,
  };
}

function normalizeFacts(rawFacts) {
  if (!Array.isArray(rawFacts)) {
    return [];
  }

  return rawFacts.map(normalizeFactItem).filter(Boolean).sort(bySequence);
}

function normalizeRadioFactGroups(rawGroups) {
  if (!Array.isArray(rawGroups)) {
    return [];
  }

  return rawGroups
    .filter(Boolean)
    .map((group, index) => ({
      id: group.id ?? index,
      name: group.name ?? '',
      description: group.description ?? '',
      sequence: group.sequence ?? index,
      facts: normalizeFacts(group.facts ?? group.radioFactGroupFacts),
    }))
    .sort(bySequence);
}

export function normalizeTemplateFactGroups(rawGroups) {
  if (!Array.isArray(rawGroups)) {
    return [];
  }

  return rawGroups
    .filter(Boolean)
    .map((entry, index) => {
      const group = entry.factGroup ?? entry;

      return {
        id: group.id ?? entry.id ?? index,
        name: group.name ?? '',
        description: group.description ?? '',
        sequence: entry.sequence ?? group.sequence ?? index,
        facts: normalizeFacts(group.factGroupFacts ?? group.facts),
        radioFactGroups: normalizeRadioFactGroups(group.radioFactGroups),
      };
    })
    .sort(bySequence);
}
