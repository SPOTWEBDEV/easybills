# EasyBills

A modern, premium fintech-style web app for bill payments — airtime, data, electricity, cable TV, exam pins and more. This frontend is connected to a real backend: **[easybills-backend](../easybills-backend)**, a pure-PHP API integrated with ePINs (bill payment provider) and Paystack (wallet funding).

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then edit NEXT_PUBLIC_API_URL if needed
npm run dev
```

Open http://localhost:3000 — you'll need `easybills-backend` running too (see its own README for setup). By default this expects the backend at `http://localhost:8000`.

To build for production:

```bash
npm run build
npm run start
```

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the `easybills-backend` API, no trailing slash. Local: `http://localhost:8000`. Production: your cPanel API subdomain, e.g. `https://api.yourdomain.com`. |

`.env.local` (already created, edit as needed) is gitignored — `.env.local.example` is the committed reference copy.

## Demo / seeded credentials

These come from the backend's seed data, not from anything hardcoded in the frontend:

- **User signup**: register any account — OTP verification code is `123456` in the backend's local/sandbox mode (also logged to `easybills-backend/storage/logs/otp.log`)
- **Admin login** (`/admin/login`): `admin@easybills.example` / `ChangeMe123!` — change this in the database before going live

## How this connects to the backend

Every function in `lib/api/*.ts` and `lib/api/admin/*.ts` calls the real backend through `lib/api-client.ts`, which:

- Attaches `Authorization: Bearer <token>` to authenticated requests (separate tokens for user vs admin sessions, both in `localStorage`)
- Unwraps the backend's `{ data: [...] }` list envelope where needed (`unwrapList()`)
- Throws a typed `ApiError` with the backend's real error message on failure, which every form/page catches and shows via `toast.error(...)`

There is no artificial network delay or fake data left in this layer — `await delay(...); return dummyData;` has been fully replaced with `fetch()` calls.

### Auth guards

- `AppShell` (wraps every user-facing app page) checks for a user token on mount and redirects to `/login` if missing.
- `AdminShell` (wraps every `/admin/*` page) checks for an admin token and redirects to `/admin/login` if missing. This is new — the admin panel previously had no authentication at all.

### Wallet funding is real Paystack, not instant credit

`/wallet/fund` calls `POST /wallet/fund/initialize` and redirects the browser to Paystack's hosted checkout. The wallet is **not** credited by this call — it's credited by the backend's `/webhooks/paystack` endpoint once Paystack confirms payment server-to-server. After paying, Paystack redirects back to `/wallet/fund/callback`, which polls `GET /transactions/{reference}` for a few seconds until the transaction flips from `pending` to `success` (or `failed`), then shows the right outcome screen.

For this to work end-to-end you need:
1. The backend's `PAYSTACK_SECRET_KEY` set to a real key
2. Your Paystack webhook URL registered as `https://<your-backend-domain>/api/v1/webhooks/paystack`

### Statement export

`/statement`'s "Download statement (CSV)" button calls the backend's `GET /statement.csv` directly (with the auth token attached via `downloadAuthed()`, since a plain link can't carry an Authorization header) and downloads the real file the backend generates — it no longer builds the CSV client-side from already-fetched data.

## What's fully connected to the backend

- **Auth**: register, OTP verify, login, forgot/reset password, logout, current-user fetch
- **Wallet**: balance, real Paystack funding (initialize + webhook-confirmed), withdrawal
- **Services**: Airtime, Data (with real ePINs-backed providers/plans), Electricity (with meter lookup) — purchases call the real backend, which calls ePINs, with automatic wallet refund if the provider call fails
- **Transactions**: history, detail, summary, CSV statement export
- **Admin**: login (with real session, previously had none), Dashboard (stats + revenue trend + top services, all computed from real transaction rows), Customers, Transactions, Orders, Sales, Revenue, Analytics, Wallets (withdrawal approve/reject — reject auto-refunds the wallet), Products, Pricing, Profit Settings (editing margins is real and immediately affects future purchase prices), Bill Providers (plus a live ePINs connectivity check), Coupons (list + real create)

## What's still preview/mock data

The backend's README documents which admin modules don't have controllers yet (the database tables exist, but nothing serves them over the API): **Agents, Commissions, Referral Program, Announcements, Notifications, Reports, Support Tickets, Blog, Pages, Roles & Permissions, Audit Logs, Activity Logs, API Management, Media Library**. Each of these pages now shows a visible "preview data" banner so it's never ambiguous whether you're looking at real numbers — nothing on those pages reads or writes to the real database. The end-user **Referrals & Earnings** page (`/referrals`) is in the same situation: the referral code shown is derived from your real logged-in name, but the history list below it is clearly labeled "(preview)" since there's no `referrals` endpoint yet either.

Wiring these up follows the exact same pattern as the connected ones — see `lib/api/admin/customers.ts` for the simplest example to copy, and the matching controller in `easybills-backend/src/Controllers/Admin/`.

## What's implemented (features, not just wiring)

- **Landing page**: hero, services grid, how-it-works, features, agent/profit-margin teaser, FAQ, footer — with an install-to-home-screen prompt
- **Auth**: login & register with a split image/form layout, OTP verification, forgot/reset password, post-signup welcome/onboarding screen
- **Dashboard**: wallet balance (scratch-to-reveal), quick actions, recent transactions
- **Wallet**: overview, real Paystack funding, withdraw, history with filters, statement of account, payment methods page
- **Services**: Airtime purchase, Data bundle purchase, Electricity bill payment (with meter lookup) — each with a confirmation modal and a receipt screen with working Share (Web Share API / clipboard fallback) and Download (real file export). Other bill categories (water, cable, WAEC, NECO, JAMB, NABTEB, recharge cards, betting, gift cards) are scaffolded on the services page as "coming soon" — the backend's `EpinsClient` already has the methods ready for these, just no controller/UI yet.
- **Transactions**: searchable, filterable history + transaction detail/receipt page with working share/download
- **Statement of Account**: date-range filter (presets or custom), running summary, real backend CSV export
- **Referrals & Earnings**, **Security** and **Preferences** settings pages, **Payment Methods** page
- **Floating AI support chat**: available on every page, gives contextual mock replies about airtime, wallet, bills, security, refunds and agents — this one's intentionally still a keyword-matching mock (see `lib/api/ai-support.ts`), not connected to a real AI backend; conversation persists to `sessionStorage` for the browser session only
- **Admin Panel** (`/admin`): full 26-page back office, now behind real authentication — see connection status above
- **PWA**: manifest, service worker with offline caching, offline fallback page, install prompt, app icons
- **Dark / light mode**, mobile bottom navigation with a floating quick-purchase button
- **Design system**: a single-hue teal (`brand`) color theme, Space Grotesk / Inter / IBM Plex Mono type, and a signature "notch card" perforated-edge motif echoing physical recharge/scratch cards

## Project structure

```
app/                  Next.js App Router routes
components/
  ui/                 Base design-system primitives (button, card, input, dialog, etc.)
  layout/              App shell (with auth guard), bottom nav, top bar, site header/footer
  admin/               Admin shell (with auth guard), sidebar, data table, stat card, preview-data banner
  dashboard/           Balance card, quick actions, transaction list item
  landing/             Marketing page sections
  shared/              Reusable cross-cutting components (notch card, receipt, AI chat, auth shells...)
lib/
  api-client.ts        Core fetch wrapper: base URL, auth tokens, error parsing, CSV download
  api/                 Real API functions calling the backend (auth, wallet, airtime, data,
                        electricity, transactions) + api/admin/* for the connected admin modules
  mock-data/admin.ts   Preview data for the admin modules with no backend endpoint yet
  types/               Shared TypeScript types (mirror the backend's JSON response shapes)
  validators/          Zod schemas used by react-hook-form
hooks/                 React Query hooks wrapping the real API (use-auth, use-wallet,
                       use-transactions, use-services)
public/
  icons/               PWA app icons
  manifest.json         Web app manifest
  sw.js                 Service worker
  offline.html          Offline fallback page
```
