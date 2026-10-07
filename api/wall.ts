import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';
import { UID_RE } from './_store.js';

/**
 * Builds the CPX Research wall URL for one visitor on the server, so the app's secure hash never reaches the browser.
 * Env: CPX_APP_ID (or VITE_CPX_APP_ID) and, if "secure hash" is enabled in the CPX publisher area, CPX_SECURE_HASH.
 *
 * Assumption: CPX's wall hash is md5("<ext_user_id>-<app secure hash>"). CPX's public docs don't state the formula,
 * so if the wall rejects it, change `hashFor` below.
 */
const hashFor = (uid: string, secret: string) => createHash('md5').update(`${uid}-${secret}`).digest('hex');

export default function handler(req: VercelRequest, res: VercelResponse) {
  const appId = (process.env.CPX_APP_ID ?? process.env.VITE_CPX_APP_ID ?? '').trim();
  if (!appId) return res.status(503).json({ error: 'CPX app id is not configured' });

  const uid = String(Array.isArray(req.query.uid) ? req.query.uid[0] : req.query.uid ?? '');
  if (!UID_RE.test(uid)) return res.status(400).json({ error: 'bad uid' });

  const params = new URLSearchParams({ app_id: appId, ext_user_id: uid });
  const secret = (process.env.CPX_SECURE_HASH ?? '').trim();
  if (secret) params.set('secure_hash', hashFor(uid, secret));

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ url: `https://wall.cpx-research.com/index.php?${params}` });
}
