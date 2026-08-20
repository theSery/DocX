function bySequence(a, b) {
  return (a?.sequence ?? 0) - (b?.sequence ?? 0);
}

// Facts arrive either as plain objects (category hierarchy) or wrapped in a
// join row as `{ fact }` (template details endpoint).
function normalizeFacts(rawFacts) {
  if (!Array.isArray(rawFacts)) {
    return [];
  }

  return rawFacts
    .map(item => item?.fact ?? item)
    .filter(Boolean)
    .slice()
    .sort(bySequence);
}

function normalizeRadioFactGroups(rawGroups) {
  if (!Array.isArray(rawGroups)) {
    return [];
  }

  return rawGroups.filter(Boolean).map((group, index) => ({
    id: group.id ?? index,
    name: group.name ?? '',
    description: group.description ?? '',
    facts: normalizeFacts(group.facts ?? group.radioFactGroupFacts),
  }));
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
