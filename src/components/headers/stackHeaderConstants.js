export const HOME_STACK_HEADER_EXPANDED_HEIGHT = 180;
export const HOME_STACK_HEADER_COLLAPSED_HEIGHT = 46;
export const ACCOUNT_STACK_HEADER_EXPANDED_HEIGHT = 250;
export const ACCOUNT_STACK_HEADER_COLLAPSED_HEIGHT = 66;
/** Scroll offset before the header begins to collapse. */
export const HOME_STACK_HEADER_COLLAPSE_START = 28;

/** Scroll distance over which the header fully collapses (after start). */
export const HOME_STACK_HEADER_COLLAPSE_DISTANCE = 120;

/** Extra collapse range when list content exceeds the viewport. */
export const HOME_STACK_HEADER_COLLAPSE_DISTANCE_EXTRA = 46;

export const HOME_STACK_HEADER_COLLAPSE_SCROLL_END =
  HOME_STACK_HEADER_COLLAPSE_START + HOME_STACK_HEADER_COLLAPSE_DISTANCE;

export const HOME_STACK_HEADER_COLLAPSIBLE_HEIGHT =
  HOME_STACK_HEADER_EXPANDED_HEIGHT - HOME_STACK_HEADER_COLLAPSED_HEIGHT;

export const HOME_STACK_HEADER_COLLAPSE_ANIMATION = {
  duration: 1400,
};
