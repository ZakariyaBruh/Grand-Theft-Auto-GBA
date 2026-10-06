import type { VercelRequest, VercelResponse } from '@vercel/node';
import { UID_RE, redis, storeConfigured } from './_store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const uid = String(req.query.uid ?? '');
  if (!UID_RE.test(uid)) return res.status(400).json({ error: 'bad uid' });
  if (!storeConfigured) return res.status(503).json({ error: 'store not configured' });

  const [pts, offers] = (await redis('MGET', `pts:${uid}`, `offers:${uid}`)) as (string | null)[];
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ points: Number(pts ?? 0), offers: Number(offers ?? 0) });
}
