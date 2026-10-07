import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { UID_RE, creditOffer, storeConfigured } from './_store.js';

/**
 * CPAGrip postback receiver. Configure the postback URL in the CPAGrip dashboard as
 *   https://<your-site>/api/postback?secret=<POSTBACK_SECRET>&uid={tracking_id}&txid={...}&payout={...}
 * and replace the {macros} with the ones CPAGrip shows for your account.
 * Param names can be remapped with POSTBACK_UID_PARAM / POSTBACK_TXID_PARAM.
 */
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

function secretOk(given: string): boolean {
  const want = process.env.POSTBACK_SECRET || (process.env.VERCEL || process.env.NODE_ENV === 'production' ? '' : 'dev-secret');
  if (!want) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!secretOk(first(req.query.secret))) return res.status(401).send('bad secret');
  if (!storeConfigured) return res.status(503).send('store not configured');

  const uid = first(req.query[process.env.POSTBACK_UID_PARAM ?? 'uid']);
  const txid = first(req.query[process.env.POSTBACK_TXID_PARAM ?? 'txid']);
  if (!UID_RE.test(uid)) return res.status(400).send('bad uid');
  if (!txid || txid.length > 128) return res.status(400).send('bad txid');

  // Each conversion id can only be credited once, even if CPAGrip retries.
  try {
    await creditOffer(uid, txid);
    return res.status(200).send('1');
  } catch (e) {
    console.error('postback failed:', e);
    return res.status(500).send('error');
  }
}
