# Liquid Void

A black liquid-glass portal around a CPX Research survey wall. You do a survey, Zak gets paid, you get Void Points (worth what they sound like) and a few small perks.

Surveys come from the CPX Research **API** (`api/surveys.ts`) and are rendered by our own UI, so layout, sorting and copy are ours. The visitor's real IP and user agent are passed to CPX so it can match surveys to them.

Points are **verified server-side**: the browser creates a random ID that CPX receives as `ext_user_id`. When a survey completes, CPX calls `/api/postback`, which credits that ID. The browser can only read its balance, never write it.

## Deploy on Vercel

Set these environment variables, then redeploy:

| Name | Value |
| --- | --- |
| `CPX_APP_ID` | your CPX Research app ID |
| `CPX_SECURE_HASH` | the app's secure hash from the CPX publisher area (only if that option is on) |
| `POSTBACK_SECRET` | a long random string (32+ letters/digits) |
| `TURSO_API` | the Turso database auth token (`turso db tokens create <db>`) |
| `HYPERBEAM_KEY` | optional, enables the cloud-browser perk |
| `TURSO_DATABASE_URL` | optional, defaults to this project's database |

Tables are created automatically on first use.

### CPX Research postback

In the CPX publisher area, Postback Settings, paste into **Main Postback URL**:

```
https://<your-site>/api/postback?secret=<POSTBACK_SECRET>&uid={user_id}&txid={trans_id}&status={status}&amount_usd={amount_usd}&amount_local={amount_local}
```

- `status=1` earns points once per `trans_id`; `status=2` (cancelled/fraud, sent later) takes them back; a payout of 0 (screen-out) earns nothing.
- Leave the separate Screen Out Postback field empty.
- `secure_hash` is computed on the server as md5(`<user id>-<CPX_SECURE_HASH>`), as in the CPX docs.

## Local

```
npm install
npm run dev
```

Locally, set `TURSO_API` in `.env.local` or the points balance shows as unavailable.
