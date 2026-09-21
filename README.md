# EasyBills — Admin Dashboard & Landing Page

A fresh Next.js (App Router) + Tailwind CSS rebuild of the EasyBills admin panel and marketing
landing page, wired up to the EasyBills REST API described in your integration guide. The
consumer-facing app stays on mobile — this project covers **only** the admin dashboard and the
one-page landing site.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # adjust NEXT_PUBLIC_API_BASE_URL if needed
npm run dev
```

Open `http://localhost:3000` for the landing page, and `http://localhost:3000/login` to sign in
to the admin panel with an admin account (`POST /admin/auth/login`).

## Structure

```
src/
  app/
    page.tsx                 Landing page (single page, anchor-linked sections)
    login/page.tsx            Admin login (POST /admin/auth/login)
    (admin)/layout.tsx        Sidebar + topbar shell, guards every admin route
    (admin)/dashboard/        Stats + revenue trend + top services
    (admin)/analytics/        Deeper revenue/service breakdown
    (admin)/revenue/          Revenue-focused view
    (admin)/sales/            Sales count + recent successful sales
    (admin)/transactions/     All platform transactions, status tabs + search
    (admin)/orders/           Service purchases only (airtime/data/electricity/cable)
    (admin)/wallets/          Wallet balances + Paystack funding activity
    (admin)/customers/        Customer list, search, KYC/status
    (admin)/customers/[id]/   Customer detail, suspend/reactivate, wallet, history
    (admin)/products/         Product catalog, enable/disable, sync data plans
    (admin)/agents/           Placeholder — no agents endpoint in the API guide yet
    (admin)/commissions/      Placeholder — no commissions endpoint yet
    (admin)/referral-program/ Stats, top referrers, and reward-amount settings (super_admin only)
    (admin)/notifications/    Send announcements (push/email) to customers + broadcast history
  components/                 Sidebar, topbar, stat cards, badges, charts, empty/error states
  lib/
    api.ts                    Typed fetch client for every documented endpoint
    auth.tsx                  Admin session context (token in localStorage) + route guard
    types.ts                  Shapes from the API guide
    utils.ts                  Currency/date formatting
```

## What's fully wired vs. placeholder

Everything under **Dashboard, Analytics, Revenue, Sales, Transactions, Orders, Wallets,
Customers, Products, Referral Program, Notifications** calls real endpoints from your API guides
(`/admin/dashboard/*`, `/admin/customers*`, `/admin/transactions`, `/admin/products*`,
`/admin/pricing`, `/admin/providers*`, `/admin/referral-program*`, `/admin/notifications`).

**Referral Program** (`/referral-program`) shows total referrals, rewards paid out, conversion
rate, and a top-referrers table from `GET /admin/referral-program`. The reward-settings form
(referrer reward + referred/welcome reward) calls `PUT /admin/referral-program/settings`, which
your API guide restricts to `super_admin` — the page checks `admin.role` from `GET
/admin/auth/me` and disables the inputs (read-only) for non-super_admins, only rendering the Save
button when the signed-in admin is a super_admin.

**Notifications** (`/notifications`) is the admin "send announcement" screen from the
notifications guide: a form (title, message, channel, audience) that calls `POST
/admin/notifications`, and a history table from `GET /admin/notifications`. This is intentionally
scoped to *broadcasts the admin sends to customers* — there's no FCM device registration, push
permission prompts, or notification-inbox code here, because that's the mobile app's job, not a
browser-based admin panel's. The topbar bell icon links to this page instead of showing a fake
unread badge, since the admin dashboard has no notification inbox of its own in the API guide.

**Agents and Commissions** are still in the sidebar (to match the reference screenshots) but the
API guides don't document backend endpoints for them yet. Each renders a clean "not wired up"
empty state rather than fake data — add the corresponding functions to `src/lib/api.ts` and the
pages once those routes exist.

## Auth

- The admin token is stored in `localStorage` and attached as `Authorization: Bearer <token>` on
  every admin request.
- A `401` with `sessionExpired: true` clears the stored token; the admin layout then redirects to
  `/login`.
- There's no admin registration flow here on purpose — admin accounts are provisioned on the
  backend.

## Notes

- **Design system**: rebuilt around the recovered original — a warm "paper" light theme with an
  "ink" dark theme, toggled via a `.dark` class and persisted to `localStorage` (see
  `src/lib/theme.tsx`). Typefaces are Space Grotesk (display), Inter (body), and IBM Plex Mono
  (monospace — used for transaction references, amounts). Colors and CSS custom properties in
  `src/app/globals.css` are the actual recovered stylesheet, plus a couple of additive variables
  (`--bg-hover`, `--fg-faint`) so hover/faint states work without changing any of the original
  values. The `notch-card` ticket-perforation motif from the original stylesheet is used on the
  landing page's wallet balance card, echoing the physical recharge/scratch cards the platform
  sells.
- Landing page (`src/app/page.tsx`) is composed exactly as recovered: `SiteHeader`, `Hero`,
  `TrustBar`, `ServicesGrid`, `HowItWorks`, `Features`, `AgentCta`, `Faq`, `FinalCta`,
  `SiteFooter`, under `src/components/layout/` and `src/components/landing/`.
- Charts use `recharts`; icons use `lucide-react`.
- Fonts load via `next/font/google` at build time (self-hosted afterward, no runtime requests to
  Google). This needs internet access during `npm run build` / first `npm run dev`. If you're
  building somewhere offline or behind a strict proxy, swap the three imports in
  `src/app/layout.tsx` for `next/font/local` with font files you've downloaded once.
- The `NEXT_PUBLIC_API_BASE_URL` env var lets you point at a staging API without touching code.
