// Minimal Upstash Redis REST client, with an in-memory fallback for local dev only
const URL_ = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

// In production (Vercel) the in-memory fallback is off: serverless instances don't share memory,
// so points would silently vanish. There, a missing Redis config is reported as not configured.
const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const hasRedis = Boolean(URL_ && TOKEN);
export const storeConfigured = hasRedis || !isProd;

// In-memory fallback database
const memoryStore = new Map<string, string | number>();

export async function redis(...cmd: (string | number)[]): Promise<unknown> {
  if (hasRedis) {
    try {
      const res = await fetch(URL_!, {
        method: 'POST',
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(cmd),
      });
      if (res.ok) {
        return ((await res.json()) as { result: unknown }).result;
      }
      if (isProd) throw new Error(`Redis ${res.status}`);
    } catch (e) {
      if (isProd) throw e;
      console.warn('Failed to contact Upstash Redis, using in-memory store instead:', e);
    }
  }
  if (isProd) throw new Error('Redis is not configured');

  // Fallback to mock in-memory implementation of Upstash Redis commands
  const [op, ...args] = cmd;
  const opUpper = String(op).toUpperCase();

  if (opUpper === 'MGET') {
    return args.map(key => {
      const val = memoryStore.get(String(key));
      return val !== undefined ? String(val) : null;
    });
  }

  if (opUpper === 'SET') {
    const [key, value, ...options] = args;
    const nxIndex = options.indexOf('NX');
    if (nxIndex !== -1 && memoryStore.has(String(key))) {
      return null;
    }
    memoryStore.set(String(key), String(value));
    return 'OK';
  }

  if (opUpper === 'INCR') {
    const [key] = args;
    const current = Number(memoryStore.get(String(key)) ?? 0);
    const next = current + 1;
    memoryStore.set(String(key), next);
    return next;
  }

  if (opUpper === 'INCRBY') {
    const [key, value] = args;
    const increment = Number(value ?? 0);
    const current = Number(memoryStore.get(String(key)) ?? 0);
    const next = current + increment;
    memoryStore.set(String(key), next);
    return next;
  }

  throw new Error(`Unsupported Mock Redis command: ${opUpper}`);
}

export const UID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const POINTS_PER_OFFER = 100;
