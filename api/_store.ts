import { createClient, type Client } from '@libsql/client';

// Turso (libSQL). On Vercel set TURSO_API (the database auth token) and, optionally, TURSO_DATABASE_URL.
const DEFAULT_URL = 'libsql://givememoney-zakarius.aws-us-east-1.turso.io';
const TOKEN = process.env.TURSO_API ?? process.env.TURSO_AUTH_TOKEN;
const URL_ = process.env.TURSO_DATABASE_URL ?? DEFAULT_URL;

// All data requests must strictly go to TURSO API. No local file or in-memory fallback.
export const storeConfigured = Boolean(TOKEN);

export const UID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const POINTS_PER_OFFER = 100;
export const STORAGE_ERROR = 'Our servers have run out of storage';

let client: Client | undefined;
let ready: Promise<void> | undefined;

function db(): Promise<Client> {
  if (!TOKEN) {
    throw new Error(STORAGE_ERROR);
  }
  if (!client) {
    client = createClient({ url: URL_, authToken: TOKEN });
    ready = client.batch(
      [
        'CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, points INTEGER NOT NULL DEFAULT 0, offers INTEGER NOT NULL DEFAULT 0)',
        'CREATE TABLE IF NOT EXISTS conversions (txid TEXT PRIMARY KEY, uid TEXT NOT NULL, created_at INTEGER NOT NULL)',
        'CREATE TABLE IF NOT EXISTS slots (key TEXT PRIMARY KEY, expires_at INTEGER NOT NULL)',
      ],
      'write',
    ).then(() => undefined)
    .catch((err) => {
      console.error('Turso DB connection error:', err);
      client = undefined;
      ready = undefined;
      throw new Error(STORAGE_ERROR);
    });
  }
  return ready.then(() => client!);
}

export async function getStats(uid: string): Promise<{ points: number; offers: number }> {
  try {
    const c = await db();
    const r = await c.execute({ sql: 'SELECT points, offers FROM users WHERE uid = ?', args: [uid] });
    const row = r.rows[0];
    return { points: Number(row?.points ?? 0), offers: Number(row?.offers ?? 0) };
  } catch (err) {
    console.error('Turso getStats error:', err);
    throw new Error(STORAGE_ERROR);
  }
}

/** Credits one offer. Each txid is counted once, so postback retries are harmless. Returns true if new. */
export async function creditOffer(uid: string, txid: string): Promise<boolean> {
  try {
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
      try {
        tx.close();
      } catch {}
    }
  } catch (err) {
    console.error('Turso creditOffer error:', err);
    throw new Error(STORAGE_ERROR);
  }
}

/** Takes a rate-limit slot for `seconds`. Returns false if one is already held. */
export async function claimSlot(key: string, seconds: number): Promise<boolean> {
  try {
    const c = await db();
    const now = Date.now();
    const r = await c.execute({
      sql: `INSERT INTO slots (key, expires_at) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET expires_at = excluded.expires_at WHERE slots.expires_at <= ?`,
      args: [key, now + seconds * 1000, now],
    });
    return r.rowsAffected === 1;
  } catch (err) {
    console.error('Turso claimSlot error:', err);
    throw new Error(STORAGE_ERROR);
  }
}
