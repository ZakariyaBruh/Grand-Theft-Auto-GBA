export const WALL_ID = '1917436';
export const WALL_BASE = 'https://ridefiles.net/help/ablk.php?lkt=4';
/** Query param the offer wall uses to carry our user id through to the postback. */
export const TRACKING_PARAM = 'tracking_id';

export const wallUrl = (uid: string) => `${WALL_BASE}&${TRACKING_PARAM}=${encodeURIComponent(uid)}`;

export const MINUTES_PER_OFFER = 4;
export const DOLLARS_PER_OFFER = 1.42;
export const POINTS_PER_OFFER = 100;
