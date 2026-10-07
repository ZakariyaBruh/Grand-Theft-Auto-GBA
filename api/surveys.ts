import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';
import { UID_RE } from './_store.js';

/**
 * Survey list for one visitor from the CPX Research API.
 * Env: CPX_APP_ID (or VITE_CPX_APP_ID) and CPX_SECURE_HASH (secure_hash = md5("<ext_user_id>-<app secure hash>"), per the CPX docs).
 *
 * CPX needs the visitor's own IP address and user agent: it uses them to decide which surveys that person can
 * actually take. We pass the real ones through untouched.
 */
const API = 'https://live-api.cpx-research.com/api/get-surveys.php';

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

function clientIp(req: VercelRequest): string {
  const fwd = one(req.headers['x-forwarded-for']).split(',')[0]?.trim();
  return fwd || one(req.headers['x-real-ip']) || req.socket?.remoteAddress || '';
}

interface CpxSurvey {
  id: string | number;
  loi?: number;
  payout_publisher_usd?: number;
  statistics_rating_avg?: number;
  statistics_rating_count?: number;
  category?: string;
  webcam?: number;
  href?: string;
  href_new?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const appId = (process.env.CPX_APP_ID ?? process.env.VITE_CPX_APP_ID ?? '').trim();
  if (!appId) return res.status(503).json({ error: 'CPX app id is not configured' });

  const uid = one(req.query.uid);
  if (!UID_RE.test(uid)) return res.status(400).json({ error: 'bad uid' });

  const params = new URLSearchParams({
    app_id: appId,
    ext_user_id: uid,
    output_method: 'api',
    ip_user: clientIp(req),
    user_agent: one(req.headers['user-agent']),
    limit: '30',
  });
  const secret = (process.env.CPX_SECURE_HASH ?? '').trim();
  if (secret) params.set('secure_hash', createHash('md5').update(`${uid}-${secret}`).digest('hex'));

  try {
    const r = await fetch(`${API}?${params}`, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return res.status(502).json({ error: `CPX returned ${r.status}` });
    const data = (await r.json()) as { status?: string; surveys?: CpxSurvey[]; error?: string };
    if (data.status && data.status !== 'success') {
      return res.status(502).json({ error: `CPX: ${data.status}` });
    }

    const surveys = (data.surveys ?? []).flatMap(s => {
      const href = s.href ?? s.href_new ?? '';
      // Only ever hand the browser links that point at CPX.
      let ok = false;
      try { ok = new URL(href).hostname.endsWith('cpx-research.com'); } catch { /* not a URL */ }
      if (!ok) return [];
      return [{
        id: String(s.id),
        minutes: Math.max(1, Math.round(Number(s.loi ?? 0))),
        zakUsd: Number(s.payout_publisher_usd ?? 0),
        rating: Number(s.statistics_rating_avg ?? 0),
        ratings: Number(s.statistics_rating_count ?? 0),
        category: s.category ?? '',
        webcam: Boolean(s.webcam),
        href,
      }];
    });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ surveys });
  } catch (e) {
    console.error('surveys failed:', e);
    return res.status(502).json({ error: 'Could not reach CPX Research' });
  }
}
