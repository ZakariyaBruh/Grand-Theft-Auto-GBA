import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'node:crypto';
import { UID_RE, creditOffer, reverseOffer, storeConfigured, STORAGE_ERROR } from './_store.js';

/**
 * CPX Research postback receiver. Main Postback URL in the CPX publisher area:
 *   https://<your-site>/api/postback?secret=<POSTBACK_SECRET>&uid={user_id}&txid={trans_id}&status={status}&amount_usd={amount_usd}&amount_local={amount_local}
 * Param names can be remapped with POSTBACK_UID_PARAM / POSTBACK_TXID_PARAM.
 *
 * Optional extras (CPX Research and similar networks send them):
 *   status=1 completed, status=2 reversed/cancelled  -> only status=1 earns points; status=2 takes them back
 *   amount_usd=<payout> (or amount=)  -> if present and not > 0 (screen-outs pay nothing), no points are given
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
  if (!storeConfigured) return res.status(507).send(STORAGE_ERROR);

  const uid = first(req.query[process.env.POSTBACK_UID_PARAM ?? 'uid']);
  const txid = first(req.query[process.env.POSTBACK_TXID_PARAM ?? 'txid']);
  if (!UID_RE.test(uid)) return res.status(400).send('bad uid');
  if (!txid || txid.length > 128) return res.status(400).send('bad txid');

  const status = first(req.query.status);
  const amountRaw = first(req.query.amount_usd) || first(req.query.amount);

  try {
    if (status === '2') {
      await reverseOffer(uid, txid);
      return res.status(200).send('1');
    }
    // Screen-outs and other non-paying events must not earn points.
    if ((status && status !== '1') || (amountRaw !== '' && !(Number(amountRaw) > 0))) {
      return res.status(200).send('1');
    }
    // Each conversion id can only be credited once, even if the network retries.
    await creditOffer(uid, txid);
    return res.status(200).send('1');
  } catch (e: any) {
    console.error('postback failed:', e);
    return res.status(507).send(e?.message || STORAGE_ERROR);
  }
}
