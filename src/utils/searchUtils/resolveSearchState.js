import { filterLegalIssues } from './filterLegalIssues';

export function resolveSearchState({ bucket, flattenedLegalIssues, query }) {
  if (bucket === 'closed') {
    return {
      matches: [],
      showNoResults: false,
      isDropdownOpen: false,
    };
  }

  const matches = filterLegalIssues(flattenedLegalIssues, query);

  if (bucket === 'expanded') {
    return {
      matches,
      showNoResults: matches.length === 0,
      isDropdownOpen: true,
    };
  }

  return {
    matches,
    showNoResults: matches.length === 0,
    isDropdownOpen: true,
  };
}
