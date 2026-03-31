# Cryptomatics (server)

Small **Express** admin API for operating on the same **Supabase** database as the [client](../client/). It uses the Supabase **service role** key to bypass Row Level Security for support tasks: crediting wallets, freezing app-level accounts, and banning auth users.

This package is **not** required to run the client for read-only market data. Use it when you need trusted server-side actions against `wallet`, `user`, and `transaction`, or Supabase Auth admin APIs.

## Stack

| Piece | Role |
|-------|------|
| Node.js (ES modules) | Runtime; entry `server.js` |
| Express 4 | HTTP server and JSON body parsing |
| dotenv | Loads `server/.env` (`SUPABASE_URL`, etc.) |
| `@supabase/supabase-js` | Service-role Supabase client (no session persistence) |
| Vitest + Supertest | Unit and HTTP integration tests |

## Prerequisites

- **Node.js** — Current or active LTS.
- A **Supabase project** whose public schema includes tables compatible with the app (see [client `schema.sql`](../client/schema.sql) for reference shapes: `user`, `wallet`, `transaction`).
- The Supabase **service role** secret (Dashboard → Project Settings → API). **Treat it like root access** to your database and Auth admin APIs.

## Install

From the repository root:

```bash
cd server
npm install
```

## Run

```bash
npm start
```

Listens on **`http://localhost:3000`** unless `PORT` is set:

```bash
set PORT=4000   # Windows cmd
$env:PORT=4000  # PowerShell
PORT=4000 npm start  # Unix
```

`GET /health` should return `{"ok":true}`.

### Environment

The server loads **`server/.env`** via [dotenv](https://github.com/motdotla/dotenv) (see `import 'dotenv/config'` in `server.js`). Set at least:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Project URL, e.g. `https://xxxx.supabase.co` (trimmed when used). |

`SUPABASE_URL` is **not** read from the JSON body; missing or blank values yield **500** on admin `POST` routes.

## npm scripts

| Script | Description |
|--------|-------------|
| `npm start` | Run `node server.js`. |
| `npm test` | Run Vitest once (`server.test.js`, `validation.test.js`). |
| `npm run test:watch` | Vitest in watch mode. |

## Security model and operational warnings

1. **Service role in the request body** — Every `POST` endpoint expects `service_role_key` in the JSON body; the project URL comes from **`SUPABASE_URL`** on the server (e.g. `server/.env`). Anyone who can call the server can exfiltrate the service role if traffic is intercepted or logged. **Do not expose this service on the public internet** without TLS, authentication, IP allowlists, or moving the service role to env-only and adding proper auth on your admin routes.
2. **Never commit keys** — Use secrets managers or local env for automation scripts; do not paste the service role into client-side code (the React app uses the **anon** key only).
3. **Ban duration** — `POST /ban-user` uses Supabase Auth `ban_duration: '876000h'` (effectively long-term). Adjust `server.js` if you need a different policy.

## API overview

All admin `POST` routes accept **`Content-Type: application/json`**.

### Shared admin fields (POST body)

| Field | Type | Description |
|-------|------|-------------|
| `service_role_key` | string | Service role JWT (required; not trimmed in code—avoid accidental whitespace). |

Project URL: **`SUPABASE_URL`** in the server environment (see [Environment](#environment) above). Validation lives in [`validation.js`](./validation.js) (`parseAdminCredentials`). Missing `service_role_key` yields **400**. Missing or blank `SUPABASE_URL` yields **500**.

---

### `GET /health`

Liveness check. No body.

**200** — `{ "ok": true }`

---

### `POST /credit-user`

Adds a positive amount to a user’s wallet column and appends a ledger **`transaction`** row. If the insert into `transaction` fails, the wallet update is **rolled back** to the previous balance.

| Body field | Type | Description |
|------------|------|-------------|
| `service_role_key` | string | (admin) |
| `user_id` | string | Wallet primary key (same as `user.id` in this app). |
| `amount` | number or numeric string | Must be finite and **&gt; 0**. |
| `currency` | string | `BTC`, `USD`, or `EUR` (case-insensitive, trimmed). |

**Success 200** — Example:

```json
{
  "ok": true,
  "user_id": "<uuid>",
  "currency": "USD",
  "amount": 5,
  "balance": 15
}
```

**Errors**

- **400** — Missing `user_id`, invalid `currency`, or non-positive `amount`.
- **404** — No `wallet` row for `user_id`.
- **500** — Supabase errors (fetch/update/insert); failed insert triggers wallet revert.

**Transaction row** — Inserts `type: 'AdminTopUp'`, `receiver: user_id`, `amount`, `currency`, and `sender` set to the fixed system id **`00000000-0000-0000-0000-000000000002`** (see comment in `server.js`). Your database must allow this sender value (FK rules, RLS bypassed by service role, etc.). The client uses a separate internal UUID for conversions (`00000000-0000-0000-0000-000000000001` in the dashboard code).

---

### `POST /freeze-user`

Sets `user.frozen` to **`true`**. The client treats frozen users as unable to send/receive while still allowing sign-in depending on UI logic.

| Body field | Type |
|------------|------|
| `service_role_key` | (admin) |
| `user_id` | string |

**200** — `{ "ok": true, "user_id": "<uuid>", "frozen": true }`

**404** — No matching `user` row.

---

### `POST /unfreeze-user`

Sets `user.frozen` to **`false`**.

**200** — `{ "ok": true, "user_id": "<uuid>", "frozen": false }`

**404** — No matching `user` row.

---

### `POST /ban-user`

Calls Supabase Auth **`auth.admin.updateUserById`** with a long ban duration so the user cannot sign in or refresh tokens.

| Body field | Type |
|------------|------|
| `service_role_key` | (admin) |
| `user_id` | string | **Auth user id** (same as `auth.users.id`). |

**200** — `{ "ok": true, "user_id": "<uuid>", "banned_until": "<iso or null>" }`

**404** — Error message matches “not found” (case-insensitive).

**500** — Other Auth API errors.

---

## Example `curl` (local)

Replace placeholders; **do not commit real keys**.

```bash
curl -s -X POST http://localhost:3000/credit-user ^
  -H "Content-Type: application/json" ^
  -d "{\"service_role_key\":\"YOUR_SERVICE_ROLE\",\"user_id\":\"USER_UUID\",\"amount\":10,\"currency\":\"USD\"}"
```

Ensure `SUPABASE_URL` is set in `server/.env` (or the process environment) before calling the API. (Use `\` instead of `^` for line continuation on Unix shells.)

## Programmatic use and tests

`server.js` exports the Express `app` and handler functions (`creditUser`, `freezeUser`, `unfreezeUser`, `banUser`) for testing. [`server.test.js`](./server.test.js) uses **Supertest** against `app` with mocked `@supabase/supabase-js` `createClient`.

Run:

```bash
npm test
```

## Relationship to the client

The [client](../client/) talks to Supabase with the **anon** key and end-user sessions. This server is for **operators** who intentionally use the service role. Typical flows:

- Seed or top up demo balances (`/credit-user`).
- Moderate accounts (`/freeze-user`, `/unfreeze-user`, `/ban-user`).

For end-user features (transfers, conversions), the client uses its own Supabase client and RLS policies; this server does not implement those routes.

## License

This package is part of the Cryptomatics repository. See the repository root for license terms (client README references [ISC](https://opensource.org/licenses/ISC)).
