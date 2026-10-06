# Liquid Void

A black liquid-glass portal around a CPAGrip offer wall. You do an offer, Zak gets paid, you get Void Points (worth what they sound like) and a few small perks.

Points are **verified server-side**: the browser generates a random ID, passes it to the CPAGrip offer script (via `public/wall.html`) as `tracking_id`, and CPAGrip's postback tells `/api/postback` when an offer really completed. The browser can only read its balance, never write it.

## Deploy on Vercel

1. Import the repo into Vercel.
2. Add an **Upstash Redis** store from the Vercel Marketplace (sets `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`).
3. Set `POSTBACK_SECRET` to a long random string.
4. In the CPAGrip dashboard set the postback URL to:

   ```
   https://<your-site>/api/postback?secret=<POSTBACK_SECRET>&uid={tracking_id}&txid={...}
   ```

   Replace each `{macro}` with the macro CPAGrip shows for your account (user/tracking id, and a unique conversion id for `txid`). If your param names differ, set `POSTBACK_UID_PARAM` / `POSTBACK_TXID_PARAM`.

Each `txid` is credited once, so postback retries don't double-count.

## Local

```
npm install
npm run dev     # UI only; /api needs `vercel dev`
```
