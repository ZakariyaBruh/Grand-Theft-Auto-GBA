export const WALL_ID = '1917436';
/** Our own host page for the offer script (public/wall.html); it carries the user id as tracking_id. */
export const wallUrl = (uid: string) => `/wall.html?uid=${encodeURIComponent(uid)}`;

export const MINUTES_PER_OFFER = 4;
export const DOLLARS_PER_OFFER = 1.42;
export const POINTS_PER_OFFER = 100;
