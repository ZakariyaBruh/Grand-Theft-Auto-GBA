import type { VercelRequest, VercelResponse } from '@vercel/node';
import { UID_RE, getStats, storeConfigured } from './_store.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const uid = String(req.query.uid ?? '');
  if (!UID_RE.test(uid)) return res.status(400).json({ error: 'bad uid' });
  if (!storeConfigured) return res.status(503).json({ error: 'store not configured' });

  try {
    const stats = await getStats(uid);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(stats);
  } catch (e) {
    console.error('points failed:', e);
    return res.status(500).json({ error: 'error' });
  }
}
