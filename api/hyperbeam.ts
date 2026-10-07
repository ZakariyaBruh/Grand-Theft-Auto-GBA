import type { VercelRequest, VercelResponse } from '@vercel/node';
import { UID_RE, claimSlot, getStats, storeConfigured } from './_store.js';

/** Void Points needed to launch a cloud browser (keep in sync with the perk in Perks.tsx). */
const REQUIRED_POINTS = 1000;
const COOLDOWN_SECONDS = 120;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = process.env.HYPERBEAM_KEY;
  if (!key) return res.status(503).json({ error: 'Hyperbeam is not configured' });
  if (!storeConfigured) return res.status(503).json({ error: 'store not configured' });

  // Each launch costs real money, so it is tied to a verified points balance and rate limited per user.
  const uid = String(Array.isArray(req.query.uid) ? req.query.uid[0] : req.query.uid ?? '');
  if (!UID_RE.test(uid)) return res.status(400).json({ error: 'bad uid' });

  try {
    const { points } = await getStats(uid);
    if (points < REQUIRED_POINTS) {
      return res.status(403).json({ error: `Needs ${REQUIRED_POINTS} verified Void Points` });
    }
    if (!(await claimSlot(`hb:${uid}`, COOLDOWN_SECONDS))) {
      return res.status(429).json({ error: `One cloud browser every ${COOLDOWN_SECONDS / 60} minutes. Try again shortly.` });
    }

    const response = await fetch('https://engine.hyperbeam.com/v0/vm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_url: 'https://youtube.com',
        kiosk: false,
        adblock: true,
        timeout: { absolute: 900, inactive: 120, offline: 30 },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: `Hyperbeam error ${response.status}: ${text.slice(0, 200)}` });
    }

    const data = (await response.json()) as { embed_url: string };
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ embed_url: data.embed_url });
  } catch (error) {
    console.error('Hyperbeam creation error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
