export function parseFavoriteTemplateIds(payload) {
  const raw = payload?.data ?? payload;
  if (!Array.isArray(raw)) {
    return [];
  }

  const ids = raw
    .map(value =>
      typeof value === 'object' ? value?.id ?? value?.templateId : value,
    )
    .filter(id => id != null)
    .map(Number)
    .filter(Number.isFinite);

  return [...new Set(ids)];
}

function toFavoriteIdSet(favoriteIds) {
  return new Set((favoriteIds ?? []).map(Number));
}

export function applyFavoriteFlags(items, favoriteIds) {
  const idSet = toFavoriteIdSet(favoriteIds);

  for (const category of items ?? []) {
    for (const subCategory of category.subCategories ?? []) {
      for (const legalIssue of subCategory.legalIssues ?? []) {
        let anyFavorite = false;

        for (const template of legalIssue.templates ?? []) {
          const isFavorite = idSet.has(Number(template.id));
          template.favorite = isFavorite;
          if (isFavorite) {
            anyFavorite = true;
          }
        }

        legalIssue.favorite = anyFavorite;
      }
    }
  }

  return items;
}

export function patchTemplateFavorite(items, templateId, favorite) {
  const id = Number(templateId);

  for (const category of items ?? []) {
    for (const subCategory of category.subCategories ?? []) {
      for (const legalIssue of subCategory.legalIssues ?? []) {
        let matched = false;

        for (const template of legalIssue.templates ?? []) {
          if (Number(template.id) === id) {
            template.favorite = favorite;
            matched = true;
          }
        }

        if (matched) {
          legalIssue.favorite = (legalIssue.templates ?? []).some(
            template => template.favorite,
          );
        }
      }
    }
  }

  return items;
}

export function collectFavoriteLegalIssues(categories) {
  const result = [];
  const seenIds = new Set();

  for (const category of categories ?? []) {
    for (const subCategory of category.subCategories ?? []) {
      for (const legalIssue of subCategory.legalIssues ?? []) {
        const legalIssueId = legalIssue?.id;
        if (legalIssueId != null && seenIds.has(Number(legalIssueId))) {
          continue;
        }

        const templates = (legalIssue.templates ?? []).filter(
          template => template.favorite,
        );

        if (templates.length === 0) {
          continue;
        }

        if (legalIssueId != null) {
          seenIds.add(Number(legalIssueId));
        }

        result.push({
          ...legalIssue,
          favorite: true,
          iconUrl:
            legalIssue.iconUrl || subCategory.iconUrl || category.iconUrl,
          templates,
        });
      }
    }
  }

  return result;
}

export function findLegalIssuesBySubCategory(
  categories,
  categoryId,
  subCategoryId,
) {
  if (categoryId == null || subCategoryId == null) {
    return null;
  }

  const category = (categories ?? []).find(
    item => Number(item.id) === Number(categoryId),
  );
  const subCategory = category?.subCategories?.find(
    item => Number(item.id) === Number(subCategoryId),
  );

  return subCategory?.legalIssues ?? null;
}
