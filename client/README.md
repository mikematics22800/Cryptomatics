# Cryptomatics (client)

React single-page app for exploring cryptocurrency market data, optional paper-wallet style balances in Supabase, and transfers between registered users. The UI is built with Vite, Material UI, Tailwind CSS, and Chart.js.

[![Live demo](https://img.shields.io/badge/demo-GitHub%20Pages-24292f?logo=github)](https://mikematics22800.github.io/Cryptomatics)

[![](./public/screenshot.png)](https://mikematics22800.github.io/Cryptomatics)

## Features

- **Authentication** — Email/password and Google OAuth via [Supabase Auth](https://supabase.com/docs/guides/auth). Login and register routes are public; the rest of the app requires a session.
- **Dashboard** — Signed-in home: balances, send/receive flows, and history backed by Supabase (`user`, `wallet`, `transaction`). Coin spot prices for display use the Coin Ranking API (see below).
- **Currencies** — Browse the top 100 coins from Coin Ranking with responsive layout.
- **Coin detail** — Per-coin view with history chart (Chart.js / react-chartjs-2) and time-range controls.
- **Display currency** — USD or EUR for fiat formatting; EUR conversion uses the public [Frankfurter](https://www.frankfurter.app/) API (Coin Ranking prices are treated as USD).

## Tech stack

| Area | Libraries |
|------|-----------|
| Runtime | React 18, React Router 6 |
| Build | Vite 5, `@vitejs/plugin-react` |
| Styling | Tailwind CSS, PostCSS, Material UI 5 (+ Emotion), Ant Design (select UI) |
| Data | Axios (Coin Ranking), `@supabase/supabase-js` |
| Charts | Chart.js, react-chartjs-2 |
| Animation | GSAP |
| Numbers | millify |
| Quality | ESLint (React + hooks + refresh), Vitest (unit tests in `src/**/*.test.js`) |
| Deploy | `gh-pages` (static build to `dist/`) |

## Repository layout

This folder is the **frontend** of the monorepo. A sibling [`server`](../server/) package exposes small admin HTTP endpoints (e.g. crediting users) using the Supabase service role; it is optional for local UI development if you only use market data and skip wallet features.

## Prerequisites

- **Node.js** — Current or active LTS recommended.
- **npm** — Used for scripts and lockfile (`package-lock.json`).
- **Coin Ranking API key** — Subscribe on [RapidAPI — Coinranking](https://rapidapi.com/Coinranking/api/coinranking1) and use the key as `VITE_COINRANKING_API_KEY`.
- **Supabase project** — Required for sign-in, profiles, wallets, and transactions. Create a project at [supabase.com](https://supabase.com) and enable the auth providers you need (email, Google, etc.).

## Environment variables

Create a `.env` file in this directory (`client/.env`). Vite only exposes variables prefixed with `VITE_`.

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_COINRANKING_API_KEY` | Yes* | RapidAPI key sent as `X-RapidAPI-Key` to `coinranking1.p.rapidapi.com`. |
| `VITE_SUPABASE_URL` | For auth / dashboard | Supabase project URL. |
| `VITE_SUPABASE_API_KEY` | For auth / dashboard | Supabase **anon** public key (not the service role key). |
| `VITE_AUTH_REDIRECT_URL` | Optional | Explicit OAuth / magic-link redirect base. If unset, the app uses `import.meta.env.BASE_URL` resolved against `window.location.origin` (see `src/utils/supabase.js`). |

\*Market list and coin pages need the key; the app may still load without it but API calls will fail.

Example (PowerShell):

```powershell
cd client
@"
VITE_COINRANKING_API_KEY=your_rapidapi_key
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_API_KEY=your_anon_key
"@ | Out-File -Encoding utf8 .env
```

## Installation and local development

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

Vite serves the app with `base: '/Cryptomatics/'` and the router `basename` matches (see `vite.config.js` and `src/main.jsx`). Open:

**http://localhost:5173/Cryptomatics/**

(If port 5173 is taken, Vite prints the actual URL in the terminal—keep the `/Cryptomatics/` path.)

### npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR. |
| `npm run build` | Production build to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | ESLint over `.js` / `.jsx` in the project. |
| `npm test` | Run Vitest once (Node environment). |
| `npm run test:watch` | Vitest in watch mode. |
| `npm run deploy` | Build then publish `dist/` to GitHub Pages (`predeploy` runs `build`). |

## Routing and access control

Defined in `src/main.jsx`:

| Path | Access |
|------|--------|
| `/login`, `/register` | Public (`NoAuth` — redirects away if already signed in). |
| `/` (index) | Dashboard — requires auth (`RequireAuth`). |
| `/currencies` | Top coins list — requires auth. |
| `/currencies/:id` | Coin detail — requires auth. |

Navigation chrome lives in `layouts/RootLayout.jsx`; auth pages use `layouts/AuthLayout.jsx`.

## Data and APIs

- **Coin Ranking (RapidAPI)** — `src/utils/coinranking.js` calls `GET /coins?limit=100`, `GET /coin/:id`, and `GET /coin/:id/history?timePeriod=…`.
- **Supabase** — `src/utils/supabase.js` creates the browser client, handles sign-up/in/out, OAuth redirect URL, profile fetch, and user provisioning (`ensure_user_profile` RPC when available, with fallback inserts documented in code comments).
- **Frankfurter** — Used in `src/hooks/useFiatCurrency.js` for USD/EUR display (no API key).

Reference SQL in this repo:

- `schema.sql` — **Context only** (comment in file): illustrates `user`, `wallet`, and `transaction` shapes; not guaranteed runnable as a single migration.
- `freeze.sql` — Example `SECURITY DEFINER` function for freezing inactive users (operational policy, not applied automatically by the client).

Configure Row Level Security and any RPCs (e.g. `ensure_user_profile`) in the Supabase dashboard to match your security model.

## Production build and GitHub Pages

`package.json` sets `"homepage": "https://mikematics22800.github.io/Cryptomatics"`, and Vite `base` is `/Cryptomatics/`, so assets resolve correctly under that path.

```bash
npm run build
npm run deploy
```

Ensure Supabase **redirect URLs** and optional `VITE_AUTH_REDIRECT_URL` include your deployed origin (e.g. `https://mikematics22800.github.io/Cryptomatics/`).

## Testing

Tests use Vitest with a Node environment (`vitest.config.js`). Test files follow `src/**/*.test.js` (e.g. `src/auth/resolvePostAuthPath.test.js`).

```bash
npm test
```

## License

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
