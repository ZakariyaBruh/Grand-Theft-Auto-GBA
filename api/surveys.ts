import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { UID_RE, POINTS_PER_OFFER } from './_store.js';

/**
 * Survey list for one visitor from the CPX Research API.
 * Env: CPX_APP_ID (or VITE_CPX_APP_ID) and CPX_SECURE_HASH (secure_hash = md5("<ext_user_id>-<app secure hash>"), per the CPX docs).
 *
 * CPX needs the visitor's own IP address and user agent: it uses them to decide which surveys that person can
 * actually take. We pass the real ones through untouched.
 */
const API = 'https://live-api.cpx-research.com/api/get-surveys.php';

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

/** The visitor's real IP, cleaned up (no brackets, port or ::ffff: prefix). CPX returns nothing for a malformed one. */
function clientIp(req: VercelRequest): string {
  const candidates = [
    one(req.headers['x-vercel-forwarded-for']),
    one(req.headers['x-forwarded-for']).split(',')[0] ?? '',
    one(req.headers['x-real-ip']),
    req.socket?.remoteAddress ?? '',
  ];
  for (const raw of candidates) {
    let ip = raw.trim().replace(/^\[|\]$/g, '').replace(/^::ffff:/i, '');
    if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(ip)) ip = ip.split(':')[0];
    if (isIP(ip)) return ip;
  }
  return '';
}

interface CpxSurvey {
  id: string | number;
  loi?: number;
  payout_publisher_usd?: number;
  statistics_rating_avg?: number;
  statistics_rating_count?: number;
  conversion_rate?: string | number;
  top?: number;
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

  const ip = clientIp(req);
  const params = new URLSearchParams({
    app_id: appId,
    ext_user_id: uid,
    output_method: 'api',
    ip_user: ip,
    user_agent: one(req.headers['user-agent']),
    limit: '30',
  });
  const secret = (process.env.CPX_SECURE_HASH ?? '').trim();
  if (secret) params.set('secure_hash', createHash('md5').update(`${uid}-${secret}`).digest('hex'));

  try {
    const r = await fetch(`${API}?${params}`, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return res.status(502).json({ error: `CPX returned ${r.status}` });
    const data = (await r.json()) as { status?: string; surveys?: CpxSurvey[]; error?: string; message_not_found?: string };
    if (data.status && data.status !== 'success') {
      return res.status(502).json({ error: `CPX: ${data.status}` });
    }

    const surveys = (data.surveys ?? []).flatMap(s => {
      const href = s.href ?? s.href_new ?? '';
      // Only ever hand the browser links that point at CPX.
      let ok = false;
      try { ok = new URL(href).hostname.endsWith('cpx-research.com'); } catch { /* not a URL */ }
      if (!ok) return [];
      const loi = Math.max(1, Math.round(Number(s.loi ?? 0)));
      const category = s.category && s.category.toLowerCase() !== 'general' ? `${s.category}: ` : '';
      return [{
        id: String(s.id),
        title: `${category}${loi}-minute survey #${String(s.id).slice(-4)}`,
        loi,
        cpx_points: POINTS_PER_OFFER,
        entry_link: href,
      }];
    });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(surveys);
  } catch (e) {
    console.error('surveys failed:', e);
    return res.status(502).json({ error: 'Could not reach CPX Research' });
  }
}
