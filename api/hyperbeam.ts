import type { VercelRequest, VercelResponse } from '@vercel/node';
import { UID_RE } from './_store.js';

// Hardcoded on purpose (test key); HYPERBEAM_KEY in the environment overrides it.
const HYPERBEAM_KEY = process.env.HYPERBEAM_KEY || 'sk_test_Rsb9QftIvfTmQK2fG_wZCVEWfA3Ow20L1AGVox0lrTc';
const REGION = 'NA'; // Hyperbeam's US / North America servers
const COOLDOWN_MS = 20_000;

// Best-effort per-visitor throttle (per server instance), so one tab can't spam launches.
const lastLaunch = new Map<string, number>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const uid = String(Array.isArray(req.query.uid) ? req.query.uid[0] : req.query.uid ?? '');
  if (!UID_RE.test(uid)) return res.status(400).json({ error: 'bad uid' });

  const now = Date.now();
  const wait = (lastLaunch.get(uid) ?? 0) + COOLDOWN_MS - now;
  if (wait > 0) return res.status(429).json({ error: `Give it ${Math.ceil(wait / 1000)} seconds, then try again.` });
  lastLaunch.set(uid, now);

  try {
    const response = await fetch('https://engine.hyperbeam.com/v0/vm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${HYPERBEAM_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_url: 'https://youtube.com',
        region: REGION,
        kiosk: false,
        adblock: true,
        timeout: { absolute: 900, inactive: 120, offline: 30 },
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      lastLaunch.delete(uid);
      const text = await response.text();
      return res.status(502).json({ error: `Hyperbeam error ${response.status}: ${text.slice(0, 200)}` });
    }

    const data = (await response.json()) as { embed_url: string };
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ embed_url: data.embed_url });
  } catch (error) {
    lastLaunch.delete(uid);
    console.error('Hyperbeam creation error:', error);
    return res.status(502).json({ error: 'Could not reach Hyperbeam. Try again.' });
  }
}
