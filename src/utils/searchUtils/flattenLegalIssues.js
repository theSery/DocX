export function flattenLegalIssues(categories) {
  if (!Array.isArray(categories)) {
    return [];
  }

  const flattened = [];

  for (const category of categories) {
    const subCategories = category.subCategories;
    if (!Array.isArray(subCategories)) {
      continue;
    }

    for (const subCategory of subCategories) {
      const legalIssues = subCategory.legalIssues;
      if (!Array.isArray(legalIssues)) {
        continue;
      }

      for (const legalIssue of legalIssues) {
        const name = legalIssue?.name;
        if (!name) {
          continue;
        }

        flattened.push({
          id:
            legalIssue.id ??
            `${category.id}-${subCategory.id}-${name}`,
          label: name,
          normalizedName: name.toLowerCase(),
          legalIssue,
          category,
          subCategory,
        });
      }
    }
  }

  return flattened;
}
