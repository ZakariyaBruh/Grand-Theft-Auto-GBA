# Liquid Void

A black liquid-glass portal around a CPX Research survey wall. You do a survey, Zak gets paid, you get Void Points (worth what they sound like) and a few small perks.

Points are **verified server-side**: the browser creates a random ID and passes it to the CPX wall as `ext_user_id`. When a survey completes, CPX calls `/api/postback`, which credits that ID. The browser can only read its balance, never write it.

## Deploy on Vercel

Set these environment variables, then redeploy (`VITE_` variables are baked in at build time):

| Name | Value |
| --- | --- |
| `VITE_CPX_APP_ID` | your CPX Research app ID |
| `POSTBACK_SECRET` | a long random string (32+ letters/digits) |
| `TURSO_API` | the Turso database auth token (`turso db tokens create <db>`) |
| `TURSO_DATABASE_URL` | optional, defaults to this project's database |
| `HYPERBEAM_KEY` | optional, powers the cloud-browser perk |

Tables are created automatically on first use.

### CPX Research postback

In the CPX publisher area, Postback Settings, paste into **Main Postback URL**:

```
https://<your-site>/api/postback?secret=<POSTBACK_SECRET>&uid={user_id}&txid={trans_id}&status={status}&amount_usd={amount_usd}&amount_local={amount_local}
```

- `status=1` earns points once per `trans_id`; `status=2` (cancelled/fraud, sent later) takes them back; a payout of 0 (screen-out) earns nothing.
- Leave the separate Screen Out Postback field empty.
- Leave "secure hash" off for now: the secret in the URL is what blocks forged calls.

## Local

```
npm install
npm run dev
```

Locally, points live in a throwaway file database.
