import { MAX_HEIGHT, ROW_HEIGHT } from './constants';

function countVisibleRows(groups, expandedGroupIds, includeGroupHeaders) {
  let count = 0;

  for (const group of groups) {
    if (includeGroupHeaders) {
      count += 1;
      if (expandedGroupIds.has(group.id)) {
        count += group.results.length;
      }
    } else {
      count += group.results.length;
    }
  }

  return count;
}

export function resolveDropdownHeight({
  groupedResults,
  expandedGroupIds,
  showNoResults,
  hasSearchResults,
  includeGroupHeaders = true,
}) {
  if (!hasSearchResults && showNoResults) {
    return ROW_HEIGHT;
  }

  if (!hasSearchResults) {
    return 0;
  }

  const contentRows = countVisibleRows(
    groupedResults,
    expandedGroupIds,
    includeGroupHeaders,
  );
  const noResultsRows = showNoResults ? 1 : 0;
  const naturalHeight = (contentRows + noResultsRows) * ROW_HEIGHT;

  return Math.min(naturalHeight, MAX_HEIGHT);
}

export function resolveScrollMaxHeight({ dropdownContentHeight, showNoResults }) {
  const isCapped = dropdownContentHeight >= MAX_HEIGHT;

  if (!isCapped) {
    return undefined;
  }

  return MAX_HEIGHT - (showNoResults ? ROW_HEIGHT : 0);
}
