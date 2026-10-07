/** Your CPX Research app id (public). Set VITE_CPX_APP_ID in Vercel / .env.local. */
export const CPX_APP_ID = (import.meta.env.VITE_CPX_APP_ID as string | undefined)?.trim() ?? '';

/** CPX survey wall for one visitor. ext_user_id comes back as {user_id} in the postback. */
export const wallUrl = (uid: string) =>
  `https://wall.cpx-research.com/index.php?app_id=${encodeURIComponent(CPX_APP_ID)}&ext_user_id=${encodeURIComponent(uid)}`;

export const MINUTES_PER_OFFER = 4;
export const DOLLARS_PER_OFFER = 1.42;
export const POINTS_PER_OFFER = 100;
