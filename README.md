# Cryptomatics

Monorepo for a **React** single-page app that explores cryptocurrency market data, with optional paper-wallet style balances in Supabase and transfers between registered users. A small **Express** package (`server/`) exposes admin HTTP endpoints (e.g. crediting users) using the Supabase service role; it is optional for local UI development if you only use market data and skip wallet features.

## Repository layout

| Path | Description |
| ---- | ----------- |
| [`client/`](client/) | Frontend: Vite, Material UI, Tailwind CSS, Chart.js. |
| [`server/`](server/) | Optional admin API for trusted operations against the same Supabase database. |

---

## Client (`client/`)

The UI is built with Vite, Material UI, Tailwind CSS, and Chart.js.

### Features

- **Authentication** — Email/password and Google OAuth via [Supabase Auth](https://supabase.com/docs/guides/auth). Login and register routes are public; the rest of the app requires a session.
- **Dashboard** — Signed-in home: balances, send/receive flows, and history backed by Supabase (`user`, `wallet`, `transaction`). Coin spot prices for display use the Coin Ranking API (see below).
- **Currencies** — Browse the top 100 coins from Coin Ranking with responsive layout.
- **Coin detail** — Per-coin view with history chart (Chart.js / react-chartjs-2) and time-range controls.
- **Display currency** — USD or EUR for fiat formatting; EUR conversion uses the public [Frankfurter](https://www.frankfurter.app/) API (Coin Ranking prices are treated as USD).

### Tech stack

| Area      | Libraries                                                                   |
| --------- | --------------------------------------------------------------------------- |
| Runtime   | React 18, React Router 6                                                    |
| Build     | Vite 5, `@vitejs/plugin-react`                                              |
| Styling   | Tailwind CSS, PostCSS, Material UI 5 (+ Emotion), Ant Design (select UI)    |
| Data      | Axios (Coin Ranking), `@supabase/supabase-js`                               |
| Charts    | Chart.js, react-chartjs-2                                                   |
| Animation | GSAP                                                                        |
| Numbers   | millify                                                                     |
| Quality   | ESLint (React + hooks + refresh), Vitest (unit tests in `src/**/*.test.js`) |
| Deploy    | `gh-pages` (static build to `dist/`)                                        |

### Prerequisites

- **Node.js** — Current or active LTS recommended.
- **npm** — Used for scripts and lockfile (`package-lock.json`).
- **Coin Ranking API key** — Subscribe on [RapidAPI — Coinranking](https://rapidapi.com/Coinranking/api/coinranking1) and use the key as `VITE_COINRANKING_API_KEY`.
- **Supabase project** — Required for sign-in, profiles, wallets, and transactions. Create a project at [supabase.com](https://supabase.com) and enable the auth providers you need (email, Google, etc.).

### Environment variables (client)

Create a `.env` file in `client/`. Vite only exposes variables prefixed with `VITE_`.

| Variable                   | Required             | Purpose                                                                                                                                                               |
| -------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_COINRANKING_API_KEY` | Yes*                 | RapidAPI key sent as `X-RapidAPI-Key` to `coinranking1.p.rapidapi.com`.                                                                                               |
| `VITE_SUPABASE_URL`        | For auth / dashboard | Supabase project URL.                                                                                                                                                 |
| `VITE_SUPABASE_API_KEY`    | For auth / dashboard | Supabase **anon** public key (not the service role key).                                                                                                              |
| `VITE_AUTH_REDIRECT_URL`   | Optional             | Explicit OAuth / magic-link redirect base. If unset, the app uses `import.meta.env.BASE_URL` resolved against `window.location.origin` (see `client/src/utils/supabase.js`). |

Market list and coin pages need the key; the app may still load without it but API calls will fail.

Example (PowerShell):

```powershell
cd client
@"
VITE_COINRANKING_API_KEY=your_rapidapi_key
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_API_KEY=your_anon_key
"@ | Out-File -Encoding utf8 .env
```

### Installation and local development (client)

From the repository root:

```bash
git clone https://github.com/mikematics22800/Cryptomatics.git
cd Cryptomatics/client
npm install
```

Add `.env` as described above, then:

```bash
npm run dev
```

Vite serves the app with `base: '/Cryptomatics/'` and the router `basename` matches (see `client/vite.config.js` and `client/src/main.jsx`). Open:

**[http://localhost:5173/Cryptomatics/](http://localhost:5173/Cryptomatics/)**

(If port 5173 is taken, Vite prints the actual URL in the terminal—keep the `/Cryptomatics/` path.)

#### Client npm scripts

| Script               | Description                                                            |
| -------------------- | ---------------------------------------------------------------------- |
| `npm run dev`        | Start Vite dev server with HMR.                                        |
| `npm run build`      | Production build to `dist/`.                                           |
| `npm run preview`    | Serve the production build locally.                                    |
| `npm run lint`       | ESLint over `.js` / `.jsx` in the project.                             |
| `npm test`           | Run Vitest once (Node environment).                                    |
| `npm run test:watch` | Vitest in watch mode.                                                  |
| `npm run deploy`     | Build then publish `dist/` to GitHub Pages (`predeploy` runs `build`). |

### Routing and access control

Defined in `client/src/main.jsx`:

| Path                  | Access                                                   |
| --------------------- | -------------------------------------------------------- |
| `/login`, `/register` | Public (`NoAuth` — redirects away if already signed in). |
| `/` (index)           | Dashboard — requires auth (`RequireAuth`).               |
| `/currencies`         | Top coins list — requires auth.                          |
| `/currencies/:id`     | Coin detail — requires auth.                             |

Navigation chrome lives in `client/src/layouts/RootLayout.jsx`; auth pages use `client/src/layouts/AuthLayout.jsx`.

### Data and APIs (client)

- **Coin Ranking (RapidAPI)** — `client/src/utils/coinranking.js` calls `GET /coins?limit=100`, `GET /coin/:id`, and `GET /coin/:id/history?timePeriod=…`.
- **Supabase** — `client/src/utils/supabase.js` creates the browser client, handles sign-up/in/out, OAuth redirect URL, profile fetch, and user provisioning (`ensure_user_profile` RPC when available, with fallback inserts documented in code comments).
- **Frankfurter** — Used in `client/src/hooks/useFiatCurrency.js` for USD/EUR display (no API key).

Reference SQL in this repo:

- [`client/schema.sql`](client/schema.sql) — **Context only** (comment in file): illustrates `user`, `wallet`, and `transaction` shapes; not guaranteed runnable as a single migration.
- [`client/freeze.sql`](client/freeze.sql) — Example `SECURITY DEFINER` function for freezing inactive users (operational policy, not applied automatically by the client).

Configure Row Level Security and any RPCs (e.g. `ensure_user_profile`) in the Supabase dashboard to match your security model.

### Production build and GitHub Pages (client)

`client/package.json` sets `"homepage": "https://mikematics22800.github.io/Cryptomatics"`, and Vite `base` is `/Cryptomatics/`, so assets resolve correctly under that path.

```bash
cd client
npm run build
npm run deploy
```

Ensure Supabase **redirect URLs** and optional `VITE_AUTH_REDIRECT_URL` include your deployed origin (e.g. `https://mikematics22800.github.io/Cryptomatics/`).

### Testing (client)

Tests use Vitest with a Node environment (`client/vitest.config.js`). Test files follow `src/**/*.test.js` (e.g. `client/src/auth/resolvePostAuthPath.test.js`).

```bash
cd client
npm test
```

---

## Server (`server/`)

Small **Express** admin API for operating on the same **Supabase** database as the client. It uses the Supabase **service role** key to bypass Row Level Security for support tasks: crediting wallets, freezing app-level accounts, and banning auth users.

This package is **not** required to run the client for read-only market data. Use it when you need trusted server-side actions against `wallet`, `user`, and `transaction`, or Supabase Auth admin APIs.

### Stack

| Piece | Role |
|-------|------|
| Node.js (ES modules) | Runtime; entry `server/server.js` |
| Express 4 | HTTP server and JSON body parsing |
| dotenv | Loads `server/.env` (`SUPABASE_URL`, etc.) |
| `@supabase/supabase-js` | Service-role Supabase client (no session persistence) |
| Vitest + Supertest | Unit and HTTP integration tests |

### Prerequisites (server)

- **Node.js** — Current or active LTS.
- A **Supabase project** whose public schema includes tables compatible with the app (see [`client/schema.sql`](client/schema.sql) for reference shapes: `user`, `wallet`, `transaction`).
- The Supabase **service role** secret (Dashboard → Project Settings → API). **Treat it like root access** to your database and Auth admin APIs.

### Install and run (server)

```bash
cd server
npm install
npm start
```

Listens on **`http://localhost:3000`** unless `PORT` is set:

```bash
set PORT=4000   # Windows cmd
$env:PORT=4000  # PowerShell
PORT=4000 npm start  # Unix
```

`GET /health` should return `{"ok":true}`.

#### Environment (server)

The server loads **`server/.env`** via [dotenv](https://github.com/motdotla/dotenv) (see `import 'dotenv/config'` in `server.js`). Set at least:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Project URL, e.g. `https://xxxx.supabase.co` (trimmed when used). |

`SUPABASE_URL` is **not** read from the JSON body; missing or blank values yield **500** on admin `POST` routes.

#### Server npm scripts

| Script | Description |
|--------|-------------|
| `npm start` | Run `node server.js`. |
| `npm test` | Run Vitest once (`server.test.js`, `validation.test.js`). |
| `npm run test:watch` | Vitest in watch mode. |

### Security model and operational warnings (server)

1. **Service role in the request body** — Every `POST` endpoint expects `service_role_key` in the JSON body; the project URL comes from **`SUPABASE_URL`** on the server (e.g. `server/.env`). Anyone who can call the server can exfiltrate the service role if traffic is intercepted or logged. **Do not expose this service on the public internet** without TLS, authentication, IP allowlists, or moving the service role to env-only and adding proper auth on your admin routes.
2. **Never commit keys** — Use secrets managers or local env for automation scripts; do not paste the service role into client-side code (the React app uses the **anon** key only).
3. **Ban duration** — `POST /ban-user` uses Supabase Auth `ban_duration: '876000h'` (effectively long-term). Adjust `server/server.js` if you need a different policy.

### API overview (server)

All admin `POST` routes accept **`Content-Type: application/json`**.

#### Shared admin fields (POST body)

| Field | Type | Description |
|-------|------|-------------|
| `service_role_key` | string | Service role JWT (required; not trimmed in code—avoid accidental whitespace). |

Project URL: **`SUPABASE_URL`** in the server environment. Validation lives in [`server/validation.js`](server/validation.js) (`parseAdminCredentials`). Missing `service_role_key` yields **400**. Missing or blank `SUPABASE_URL` yields **500**.

---

##### `GET /health`

Liveness check. No body.

**200** — `{ "ok": true }`

---

##### `POST /credit-user`

Adds a positive amount to a user’s wallet column and appends a ledger **`transaction`** row. If the insert into `transaction` fails, the wallet update is **rolled back** to the previous balance.

| Body field | Type | Description |
|------------|------|-------------|
| `service_role_key` | string | (admin) |
| `user_id` | string | Wallet primary key (same as `user.id` in this app). |
| `amount` | number or numeric string | Must be finite and **> 0**. |
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

##### `POST /freeze-user`

Sets `user.frozen` to **`true`**. The client treats frozen users as unable to send/receive while still allowing sign-in depending on UI logic.

| Body field | Type |
|------------|------|
| `service_role_key` | (admin) |
| `user_id` | string |

**200** — `{ "ok": true, "user_id": "<uuid>", "frozen": true }`

**404** — No matching `user` row.

---

##### `POST /unfreeze-user`

Sets `user.frozen` to **`false`**.

**200** — `{ "ok": true, "user_id": "<uuid>", "frozen": false }`

**404** — No matching `user` row.

---

##### `POST /ban-user`

Calls Supabase Auth **`auth.admin.updateUserById`** with a long ban duration so the user cannot sign in or refresh tokens.

| Body field | Type |
|------------|------|
| `service_role_key` | (admin) |
| `user_id` | string | **Auth user id** (same as `auth.users.id`). |

**200** — `{ "ok": true, "user_id": "<uuid>", "banned_until": "<iso or null>" }`

**404** — Error message matches “not found” (case-insensitive).

**500** — Other Auth API errors.

---

### Example `curl` (local, server)

Replace placeholders; **do not commit real keys**.

```bash
curl -s -X POST http://localhost:3000/credit-user ^
  -H "Content-Type: application/json" ^
  -d "{\"service_role_key\":\"YOUR_SERVICE_ROLE\",\"user_id\":\"USER_UUID\",\"amount\":10,\"currency\":\"USD\"}"
```

Ensure `SUPABASE_URL` is set in `server/.env` (or the process environment) before calling the API. (Use `\` instead of `^` for line continuation on Unix shells.)

### Programmatic use and tests (server)

`server.js` exports the Express `app` and handler functions (`creditUser`, `freezeUser`, `unfreezeUser`, `banUser`) for testing. [`server/server.test.js`](server/server.test.js) uses **Supertest** against `app` with mocked `@supabase/supabase-js` `createClient`.

```bash
cd server
npm test
```

### Relationship to the client

The client talks to Supabase with the **anon** key and end-user sessions. The server is for **operators** who intentionally use the service role. Typical flows:

- Seed or top up demo balances (`/credit-user`).
- Moderate accounts (`/freeze-user`, `/unfreeze-user`, `/ban-user`).

For end-user features (transfers, conversions), the client uses its own Supabase client and RLS policies; the server does not implement those routes.

---

## License

[License: ISC](https://opensource.org/licenses/ISC)
