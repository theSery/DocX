export const HOME_STACK_HEADER_EXPANDED_HEIGHT = 180;
export const HOME_STACK_HEADER_EXPANDED_HEIGHT_COMPACT = 170;
export const HOME_STACK_HEADER_COLLAPSED_HEIGHT = 56;
export const ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT = 250;
export const ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT_COMPACT = 160;
export const ACCOUNT_STACK_HEADER_COLLAPSED_HEIGHT = 130;
export const ACCOUNT_STACK_HEADER_COLLAPSED_HEIGHT_COMPACT = 80;

/** Scroll offset before the header begins to collapse. */
export const HOME_STACK_HEADER_COLLAPSE_START = 12;

/**
 * Scroll distance over which the header fully collapses (after start).
 * Matched to collapsible height so content padding and header motion align.
 */
export const HOME_STACK_HEADER_COLLAPSE_DISTANCE = 134;

/** Extra collapse range when list content exceeds the viewport. */
export const HOME_STACK_HEADER_COLLAPSE_DISTANCE_EXTRA = 40;

export const HOME_STACK_HEADER_COLLAPSE_SCROLL_END =
  HOME_STACK_HEADER_COLLAPSE_START + HOME_STACK_HEADER_COLLAPSE_DISTANCE;

export const HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT =
  HOME_STACK_HEADER_EXPANDED_HEIGHT - HOME_STACK_HEADER_COLLAPSED_HEIGHT;

export function getAccountStackHeaderExpandedHeight(isCompactScreen) {
  return isCompactScreen
    ? ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT_COMPACT
    : ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT;
}

export function getAccountStackHeaderCollapsedHeight(isCompactScreen) {
  return isCompactScreen
    ? ACCOUNT_STACK_HEADER_COLLAPSED_HEIGHT_COMPACT
    : ACCOUNT_STACK_HEADER_COLLAPSED_HEIGHT;
}

export function getHomeStackHeaderExpandedHeight(isCompactScreen) {
  return isCompactScreen
    ? HOME_STACK_HEADER_EXPANDED_HEIGHT_COMPACT
    : HOME_STACK_HEADER_EXPANDED_HEIGHT;
}

export function getHomeStackHeaderCollapsibleHeight(isCompactScreen) {
  return (
    getHomeStackHeaderExpandedHeight(isCompactScreen) -
    HOME_STACK_HEADER_COLLAPSED_HEIGHT
  );
}

/** Kept for callers that previously tuned follow duration; collapse is 1:1 now. */
export const HOME_STACK_HEADER_COLLAPSE_ANIMATION = {
  duration: 0,
};
