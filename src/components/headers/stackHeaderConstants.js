export const HOME_STACK_HEADER_EXPANDED_HEIGHT = 180;
export const HOME_STACK_HEADER_COLLAPSED_HEIGHT = 46;
export const ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT = 250;
export const ACCOUNT_STACK_HEADER_COLLAPSED_HEIGHT = 130;

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

/** Smooth follow for collapse visuals (header is transparent — safe to ease). */
export const HOME_STACK_HEADER_COLLAPSE_ANIMATION = {
  duration: 220,
};
