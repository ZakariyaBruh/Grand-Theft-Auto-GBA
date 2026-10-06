// Minimal Upstash Redis REST client (Vercel Marketplace "Upstash Redis" sets these env vars).
const URL_ = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const storeConfigured = Boolean(URL_ && TOKEN);

export async function redis(...cmd: (string | number)[]): Promise<unknown> {
  if (!URL_ || !TOKEN) throw new Error('Redis is not configured');
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  return ((await res.json()) as { result: unknown }).result;
}

export const UID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const POINTS_PER_OFFER = 100;
