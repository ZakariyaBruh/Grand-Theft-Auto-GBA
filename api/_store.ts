import { createClient, type Client } from '@libsql/client';

// Turso (libSQL). On Vercel set TURSO_API (the database auth token) and, optionally, TURSO_DATABASE_URL.
const DEFAULT_URL = 'libsql://givememoney-zakarius.aws-us-east-1.turso.io';
const TOKEN = process.env.TURSO_API ?? process.env.TURSO_AUTH_TOKEN;
const URL_ = process.env.TURSO_DATABASE_URL ?? DEFAULT_URL;

const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

// In production a missing token means "not configured". Locally we fall back to a throwaway file database.
export const storeConfigured = Boolean(TOKEN) || !isProd;

export const UID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const POINTS_PER_OFFER = 100;

let client: Client | undefined;
let ready: Promise<void> | undefined;

function db(): Promise<Client> {
  if (!client) {
    client = TOKEN
      ? createClient({ url: URL_, authToken: TOKEN })
      : createClient({ url: 'file:.local-dev.db' });
    ready = client.batch(
      [
        'CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, points INTEGER NOT NULL DEFAULT 0, offers INTEGER NOT NULL DEFAULT 0)',
        'CREATE TABLE IF NOT EXISTS conversions (txid TEXT PRIMARY KEY, uid TEXT NOT NULL, created_at INTEGER NOT NULL)',
        'CREATE TABLE IF NOT EXISTS slots (key TEXT PRIMARY KEY, expires_at INTEGER NOT NULL)',
      ],
      'write',
    ).then(() => undefined);
    // A failed init (bad token, network blip) must not stay cached: drop it so the next request retries.
    ready.catch(() => { client = undefined; ready = undefined; });
  }
  return ready!.then(() => client!);
}

export async function getStats(uid: string): Promise<{ points: number; offers: number }> {
  const c = await db();
  const r = await c.execute({ sql: 'SELECT points, offers FROM users WHERE uid = ?', args: [uid] });
  const row = r.rows[0];
  return { points: Number(row?.points ?? 0), offers: Number(row?.offers ?? 0) };
}

/** Credits one offer. Each txid is counted once, so postback retries are harmless. Returns true if new. */
export async function creditOffer(uid: string, txid: string): Promise<boolean> {
  const c = await db();
  const tx = await c.transaction('write');
  try {
    const ins = await tx.execute({
      sql: 'INSERT OR IGNORE INTO conversions (txid, uid, created_at) VALUES (?, ?, ?)',
      args: [txid, uid, Date.now()],
    });
    const fresh = ins.rowsAffected === 1;
    if (fresh) {
      await tx.execute({
        sql: `INSERT INTO users (uid, points, offers) VALUES (?, ?, 1)
              ON CONFLICT(uid) DO UPDATE SET points = points + excluded.points, offers = offers + 1`,
        args: [uid, POINTS_PER_OFFER],
      });
    }
    await tx.commit();
    return fresh;
  } catch (e) {
    await tx.rollback();
    throw e;
  } finally {
    tx.close();
  }
}

/** Takes a rate-limit slot for `seconds`. Returns false if one is already held. */
export async function claimSlot(key: string, seconds: number): Promise<boolean> {
  const c = await db();
  const now = Date.now();
  const r = await c.execute({
    sql: `INSERT INTO slots (key, expires_at) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET expires_at = excluded.expires_at WHERE slots.expires_at <= ?`,
    args: [key, now + seconds * 1000, now],
  });
  return r.rowsAffected === 1;
}
