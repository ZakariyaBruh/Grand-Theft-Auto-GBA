import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';
import { UID_RE } from './_store.js';

/** What the CPX script-tag widgets need for one visitor. Only the derived hash is sent, never CPX_SECURE_HASH itself. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const appId = (process.env.CPX_APP_ID ?? process.env.VITE_CPX_APP_ID ?? '').trim();
  if (!appId) return res.status(503).json({ error: 'CPX app id is not configured' });

  const raw = req.query.uid;
  const uid = String(Array.isArray(raw) ? raw[0] : raw ?? '');
  if (!UID_RE.test(uid)) return res.status(400).json({ error: 'bad uid' });

  const secret = (process.env.CPX_SECURE_HASH ?? '').trim();
  const secureHash = secret ? createHash('md5').update(`${uid}-${secret}`).digest('hex') : '';

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ appId, secureHash });
}
