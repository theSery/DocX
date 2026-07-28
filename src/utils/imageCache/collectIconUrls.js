/**
 * Collect unique remote icon URLs from the category hierarchy.
 *
 * @param {unknown} categories
 * @param {{ levels?: Array<'category' | 'subCategory' | 'legalIssue'> }} [options]
 * @returns {string[]}
 */
export function collectIconUrls(categories, { levels } = {}) {
  const include = new Set(
    levels?.length
      ? levels
      : ['category', 'subCategory', 'legalIssue'],
  );
  const urls = new Set();

  if (!Array.isArray(categories)) {
    return [];
  }

  for (const category of categories) {
    if (include.has('category') && category?.iconUrl) {
      urls.add(category.iconUrl);
    }

    const subCategories = category?.subCategories;
    if (!Array.isArray(subCategories)) {
      continue;
    }

    for (const subCategory of subCategories) {
      if (include.has('subCategory') && subCategory?.iconUrl) {
        urls.add(subCategory.iconUrl);
      }

      if (!include.has('legalIssue')) {
        continue;
      }

      const legalIssues = subCategory?.legalIssues;
      if (!Array.isArray(legalIssues)) {
        continue;
      }

      for (const legalIssue of legalIssues) {
        if (legalIssue?.iconUrl) {
          urls.add(legalIssue.iconUrl);
        }
      }
    }
  }

  return [...urls];
}
