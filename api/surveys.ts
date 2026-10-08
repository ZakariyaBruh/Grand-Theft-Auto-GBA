import crypto from 'node:crypto';
import type { Request, Response } from 'express';

const CPX_API = 'https://live-api.cpx-research.com/api/get-surveys.php';

export default async function surveysHandler(req: Request, res: Response) {
  const uid = String(req.query.uid || '');
  const appId = process.env.VITE_CPX_APP_ID;
  const secureHash = process.env.CPX_SECURE_HASH;

  if (!appId || !secureHash) return res.status(500).json({ error: 'CPX is not configured' });
  if (!/^[0-9a-f-]{36}$/i.test(uid)) return res.status(400).json({ error: 'A valid CPX ID is required' });

  const params = new URLSearchParams({
    app_id: appId,
    ext_user_id: uid,
    output_method: 'api',
    ip_user: String(req.ip || '0.0.0.0').replace(/^::ffff:/, ''),
    secure_hash: crypto.createHash('md5').update(`${uid}-${secureHash}`).digest('hex'),
  });

  const response = await fetch(`${CPX_API}?${params}`);
  if (!response.ok) return res.status(502).json({ error: 'CPX survey service unavailable' });
  const payload = await response.json();
  const surveys = Array.isArray(payload) ? payload : payload.surveys || [];
  res.setHeader('Cache-Control', 'no-store');
  return res.json(surveys);
}
