# EasyBills web dashboard: drop-in files

Everything lives inside your existing folders (no new top-level folders):

- `app/(auth)/…` login, register, forgot-password
- `app/(dashboard)/dashboard/…` home, services (airtime, data, cable, exam-pins), fund-wallet, payment-status,
  history, notifications, set-pin, electricity, profile (+ statement, referrals, security, preferences, verification)
- `components/dashboard/…` nav, wallet-card, transaction-row, form-field, pin-input, network-picker, amount-field,
  sub-page-header, theme-toggle, avatar, auth-context, pin-prompt-context
- `hooks/` use-api-data, use-unread-count
- `lib/` api/dashboard.ts, services.ts, tx.ts, purchase-with-pin-retry.ts, validators/schemas.ts

## Check these
1. `@/components/logo` (named `Logo`) is used as-is.
2. `lib/validators/schemas.ts` replaces your schemas file (register now follows the mobile rules). Move it if yours lives elsewhere.
3. Every endpoint in `lib/api/dashboard.ts` now comes from the mobile code, and `purchase-with-pin-retry.ts` is a direct port.
4. Route groups `(auth)` and `(dashboard)` don't clash with your existing `app/` routes. Each group wraps itself in
   `<AuthProvider>`, so the root layout needs no change.
5. Landing page: `components/landing/` hero.tsx, final-cta.tsx and how-it-works.tsx are included (sign-up CTAs go to `/register`; step copy matches the real flow).
5. `.env.local`: `NEXT_PUBLIC_API_URL`.
