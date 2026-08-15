# EasyBills — PHP Backend

A pure-PHP (no framework, no Composer dependencies) REST API backend for the
EasyBills frontend, backed by MySQL/MariaDB and integrated with
[ePINs](https://www.epins.com.ng/developers/) as the upstream wholesale
provider for airtime, data, and electricity.

Every JSON response is shaped to match the TypeScript types already used by
the frontend's mock API (`lib/api/*.ts`), so pointing the frontend at this
backend is a drop-in swap, not a rewrite.

## Requirements

- PHP 8.1+ with extensions: `pdo_mysql`, `mbstring`, `curl`, `json`
- MySQL 8.0+ or MariaDB 10.4+
- Apache with `mod_rewrite` (or any server that can route all requests to
  `public/index.php` — see "Using Nginx" below)
- **No Composer, no `npm install`, no build step.** Everything is plain PHP.

## Quick start (local development)

A ready-to-edit `.env` already ships in this project (pre-filled with
production-oriented defaults for cPanel — see "Deploying to cPanel" below).
For **local development**, just point its `DB_*` and `CORS_ALLOWED_ORIGINS`
values at your local setup instead:

```bash
# 1. Edit .env: set DB_HOST=127.0.0.1, DB_USERNAME=root, DB_PASSWORD=<yours>,
#    APP_DEBUG=true, CORS_ALLOWED_ORIGINS=http://localhost:3000

# 2. Create the database and load the schema + seed data
mysql -u root -e "CREATE DATABASE easybills"
mysql -u root easybills < database/schema.sql
mysql -u root easybills < database/seed.sql

# 3. Start PHP's built-in server (fine for local dev)
php -S 127.0.0.1:8000 -t public public/index.php
```

The API is now live at `http://127.0.0.1:8000/api/v1/...`. Try:

```bash
curl http://127.0.0.1:8000/api/v1/health
# {"status":"ok","time":"..."}
```

This exact flow (schema load → seed load → built-in server → register →
verify-otp → login → fund wallet → purchase attempt with automatic refund on
provider failure → withdraw → admin login → admin dashboard) — plus the full
Paystack funding + webhook flow, including idempotency and signature
rejection — was run end-to-end against a real MySQL database while building
this backend, so the happy paths are confirmed working, not just written.

## Environment variables

`.env` ships in this project already, pre-filled with placeholders and
sensible defaults — you mainly need to fill in the secrets. `.env.example`
is the same file kept as a clean reference/reset point. Never commit real
values in either file to a public repo.

| Variable | Purpose |
|---|---|
| `DB_*` | MySQL connection |
| `JWT_SECRET` | Long random string signing all tokens — the shipped `.env` already has a freshly generated one |
| `CORS_ALLOWED_ORIGINS` | Your Next.js frontend's origin(s), comma-separated |
| `OTP_DEMO_CODE` | A code that always verifies (default `123456`), handy for testing. Real codes are also written to `storage/logs/otp.log` since no SMS gateway is wired up yet. |
| `EPINS_MODE` | `sandbox` or `live` |
| `EPINS_API_KEY` | From your [ePINs dashboard](https://app.epins.com.ng) |
| `EPINS_LIVE_BASE_URL` / `EPINS_SANDBOX_BASE_URL` | **Confirm these against your ePINs merchant dashboard.** The public docs template these as `{{baseurl}}` / `{{sandboxbaseurl}}` — only `https://api.epins.com.ng` is confirmed as the documentation root. |
| `PAYSTACK_SECRET_KEY` | From [Paystack Dashboard → Settings → API Keys & Webhooks](https://dashboard.paystack.com/#/settings/developer). Start with a `sk_test_...` key. |
| `PAYSTACK_PUBLIC_KEY` | Same page, `pk_test_...` / `pk_live_...` — used if you ever add Paystack's frontend popup instead of the redirect flow |

## Default admin login

```
Email:    admin@easybills.example
Password: ChangeMe123!
```

**Change this password immediately** — either add a `PUT /api/v1/admin/...`
password-change endpoint before going live, or update it directly in the
database with a fresh `password_hash()` value.

## ⚠️ Before going live, you must

1. **Replace the placeholder data plan codes.** `database/seed.sql` seeds
   `data_plans` with `REPLACE_ME_*` placeholder values in
   `epins_plan_code` — these are NOT real ePINs codes. Call
   `GET {baseurl}/v2/autho/variations/?service=data` (wrapped by
   `EpinsClient::getVariations('data')`) with your real API key to fetch the
   live plan list from ePINs, then update the `data_plans` table with the
   real codes and wholesale prices.
2. **Confirm the ePINs base URLs** from your merchant dashboard (see above).
3. **Set your real Paystack keys** in `.env` (`PAYSTACK_SECRET_KEY`,
   `PAYSTACK_PUBLIC_KEY`) and **register your webhook URL**
   (`https://yourdomain.com/api/v1/webhooks/paystack`) in the Paystack
   dashboard under Settings → API Keys & Webhooks — set it separately for
   test and live mode. Wallet funding is already wired to Paystack
   end-to-end (`POST /wallet/fund/initialize` → checkout →
   `POST /webhooks/paystack` credits the wallet); you just need real keys.
4. **Disable or lock down `POST /wallet/fund`.** This route instantly
   credits a wallet from a client-supplied amount with no real payment —
   useful for local testing, dangerous in production. Either delete the
   route in `src/routes.php` or restrict it behind `AdminMiddleware` for
   manual balance adjustments only.
5. **Set `APP_DEBUG=false`** so stack traces aren't returned in API
   responses (already the default in the shipped `.env`).
6. **Change `JWT_SECRET`** — the shipped `.env` already has a freshly
   generated random one, but rotate it if this file was ever shared.
7. **Wire a real SMS gateway** for OTP delivery (Termii, Africa's Talking,
   etc.) — see `Otp::deliver()` in `src/Models/Otp.php`.

## Project structure

```
public/
  index.php          Front controller — autoloader, env, router dispatch
  .htaccess          Apache rewrite rules
database/
  schema.sql         Full table definitions
  seed.sql           Network providers, DisCos, data plans, pricing, admin user
src/
  Core/
    Router.php       Minimal regex-based router
    Request.php      Parses JSON body / query / bearer token
    Response.php     JSON + CSV response helpers
    Database.php     PDO singleton
    Env.php          .env loader (no dependency)
    JWT.php          HS256 JWT encode/decode (no dependency)
    Auth.php         Issues/reads user + admin tokens
    Validator.php    Simple fluent input validation
    EpinsClient.php  ePINs API wrapper (airtime, data, electricity, TV,
                      exams, betting, recharge cards)
    EpinsException.php
    PaystackClient.php   Paystack API wrapper (initialize, verify, webhook
                          signature check) — wallet funding
    PaystackException.php
  Middleware/
    CorsMiddleware.php
    AuthMiddleware.php     Requires a valid user JWT
    AdminMiddleware.php    Requires a valid admin JWT
  Models/            Thin PDO data-access classes (User, Wallet,
                      Transaction, NetworkProvider, DataPlan,
                      ElectricityProvider, PricingRule, Otp, AdminUser,
                      Coupon, Withdrawal, AuditLog)
  Controllers/        Auth, Wallet, PaystackWebhook, Airtime, Data,
                       Electricity, Transaction, Statement
  Controllers/Admin/   AdminAuth, Dashboard, Customer, Transaction,
                       Withdrawal, Product, Pricing, Provider, Coupon
  routes.php          All route definitions
storage/logs/          OTP log (dev-mode "SMS" delivery), app error log
```

## How the profit/margin system works

This mirrors the platform spec exactly: the admin sets a margin (fixed ₦ or
%) per service category in `pricing_rules`. `PricingRule::applyMargin()`
applies it on top of the wholesale cost:

```
Airtime example: cost ₦980, fixed margin ₦30 → customer pays ₦1,010
Electricity example: cost ₦10,000, 1% margin → fee = ₦100, customer pays ₦10,100
```

Data plans are priced per-plan directly in `data_plans` (`price` vs.
`cost_price`) rather than through a category-wide rule, since data bundle
margins vary a lot plan-to-plan — adjust `price` per row instead.

Admins manage this from `GET/PUT /api/v1/admin/pricing`.

## How a purchase actually moves money (important pattern)

For airtime/data/electricity, the controller:

1. Computes the sell price (cost + margin)
2. **Debits the customer's wallet first** (fails fast, before any request
   leaves our server, if they don't have enough balance)
3. Calls ePINs
4. On success: records a `success` transaction
5. On failure (bad response code *or* network/timeout exception): **refunds
   the wallet** and records a `failed` transaction

This means EasyBills' own provider balance is never spent against an
unfunded customer purchase, and customers are never charged for a purchase
that didn't go through. This exact flow was verified in testing: a purchase
attempt against ePINs without network access correctly reserved funds,
failed at the provider call, and refunded the wallet back to its original
balance.

## How wallet funding actually works (Paystack)

Unlike purchases, funding can't safely trust anything the client tells us —
otherwise a user could just call the API and credit their own wallet for
free. So funding is split across two endpoints:

1. **`POST /wallet/fund/initialize`** (called by the frontend, with the
   user's JWT) — creates a `pending` transaction, asks Paystack to start a
   transaction, and returns `{authorizationUrl, reference}`. The frontend
   redirects the browser to `authorizationUrl` to complete payment.
2. **`POST /webhooks/paystack`** (called by Paystack's servers, not the
   frontend) — verifies the `x-paystack-signature` header (HMAC-SHA512 of
   the raw request body, signed with your secret key) before trusting
   anything in the payload. On a genuine `charge.success` event, it looks
   up the matching `pending` transaction by reference, double-checks the
   paid amount matches exactly, and **only then** credits the wallet and
   marks the transaction `success`.

This was verified end-to-end in testing, including the two cases that
matter most for a payments webhook: replaying the same webhook event twice
does **not** double-credit the wallet (the second call finds no matching
`pending` transaction and is a no-op), and a request with an invalid
signature is rejected with `401` before any of the payload is even trusted.

## API reference

All endpoints are prefixed `/api/v1`. Authenticated endpoints require
`Authorization: Bearer <token>`.

### Auth
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | — | Returns `{requiresOtp, phone}` |
| POST | `/auth/verify-otp` | — | Body: `{phone, code}` → `{user, token}` |
| POST | `/auth/resend-otp` | — | Body: `{phone}` |
| POST | `/auth/login` | — | `{email, password}` → `{user, token}` |
| POST | `/auth/forgot-password` | — | `{email}` |
| POST | `/auth/reset-password` | — | `{email, code, password}` |
| POST | `/auth/logout` | — | Stateless — client just discards the token |
| GET | `/auth/me` | ✓ | Current user |

### Wallet
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/wallet` | ✓ | |
| POST | `/wallet/fund` | ✓ | **Demo only** — instantly credits, no real payment. Don't expose in production. |
| POST | `/wallet/fund/initialize` | ✓ | Real funding: starts a Paystack transaction, returns `{authorizationUrl, reference}` — redirect the browser to `authorizationUrl` |
| POST | `/wallet/withdraw` | ✓ | |
| POST | `/webhooks/paystack` | — (signature-verified) | Paystack calls this after payment; this is the **only** place that actually credits the wallet for real funding |

### Services
| Method | Path | Auth |
|---|---|---|
| GET | `/services/airtime/providers` | — |
| POST | `/services/airtime/purchase` | ✓ |
| GET | `/services/data/providers` | — |
| GET | `/services/data/plans?provider_id=mtn` | — |
| POST | `/services/data/purchase` | ✓ |
| GET | `/services/electricity/providers` | — |
| POST | `/services/electricity/lookup` | ✓ |
| POST | `/services/electricity/purchase` | ✓ |

### Transactions
| Method | Path | Auth |
|---|---|---|
| GET | `/transactions?status=&category=&query=` | ✓ |
| GET | `/transactions/{id}` | ✓ |
| GET | `/transactions/summary` | ✓ |
| GET | `/statement.csv?from=YYYY-MM-DD&to=YYYY-MM-DD` | ✓ |

### Admin
| Method | Path | Auth |
|---|---|---|
| POST | `/admin/auth/login` | — |
| GET | `/admin/auth/me` | admin |
| GET | `/admin/dashboard/stats` | admin |
| GET | `/admin/dashboard/revenue-trend` | admin |
| GET | `/admin/dashboard/top-services` | admin |
| GET | `/admin/customers` | admin |
| GET | `/admin/customers/{id}` | admin |
| POST | `/admin/customers/{id}/suspend` | admin |
| POST | `/admin/customers/{id}/reactivate` | admin |
| GET | `/admin/transactions?status=` | admin |
| GET | `/admin/withdrawals/pending` | admin |
| POST | `/admin/withdrawals/{id}/approve` | admin |
| POST | `/admin/withdrawals/{id}/reject` | admin (refunds the wallet) |
| GET | `/admin/products` | admin |
| POST | `/admin/products/{id}/toggle-status` | admin |
| GET | `/admin/pricing` | admin |
| PUT | `/admin/pricing/{id}` | admin |
| GET | `/admin/providers` | admin |
| GET | `/admin/providers/epins-status` | admin — live ePINs wallet balance check |
| GET | `/admin/coupons` | admin |
| POST | `/admin/coupons` | admin |

### Not yet implemented as endpoints (schema is ready)

The database schema already has tables for `agents`, `commissions`,
`referrals`, `announcements`, `notifications`, `support_tickets`,
`blog_posts`, `pages`, `roles`, `activity_logs`, and `api_keys` — covering
every admin module in the product spec — but not every one has a controller
yet (Agents, Commissions, Referral Program, Announcements, Notifications,
Reports, Support Tickets, Blog, Pages, Roles, Activity Logs, API
Management, Media Library). They follow the exact same pattern as the
controllers that do exist (see `Controllers/Admin/CustomerController.php`
for the simplest example to copy), so adding them is mechanical.

`EpinsClient` also already has methods ready for **TV/cable**
(`validateSmartcard`, `rechargeDecoder`), **exam pins**
(`purchaseExamPin`), **betting** (`validateBettingAccount`,
`topupBetting`), and **recharge card generation**
(`purchaseRechargeCardPins`) — only Airtime/Data/Electricity have
controllers wired up so far, matching what the frontend currently has UI
for.

## Connecting the Next.js frontend

In `lib/api/*.ts`, replace the `await delay(...); return dummyData;` bodies
with real `fetch` calls to this backend, e.g.:

```ts
// lib/api/auth.ts
async login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Login failed.");
  }
  return res.json();
},
```

Two small frontend adjustments needed since the mock API glossed over them:

1. **`verifyOtp`** currently only takes a `code`. The real endpoint also
   needs `phone` (already available on the verify-otp page via the query
   string) — update the call site to send both.
2. **Store the JWT** (e.g. in an httpOnly cookie set by a Next.js route
   handler, or `localStorage` for a quick start) and attach
   `Authorization: Bearer <token>` to every authenticated request.

## Deploying to cPanel

This project needs no build step and no Composer, which makes cPanel
shared hosting straightforward — you're just uploading PHP files and
importing SQL. Two layout options, pick one:

**Option A — subdomain pointed at `public/` (recommended).** Cleanest and
most secure: nothing outside `public/` is ever web-accessible.

**Option B — main domain/addon domain pointed at the project root.** Use
this if your host won't let you set a subdomain's document root to a
sub-folder. The `.htaccess` in the project root already handles routing
everything into `public/` for you, but everything else in the project
(`src/`, `database/`, `.env`) technically sits in a web-reachable folder
protected only by `.htaccess` — Option A is safer if it's available to you.

### Steps

1. **Create the database.** cPanel → **MySQL® Databases** → create a
   database (e.g. `easybills`) and a user, add the user to the database
   with **All Privileges**. Note the full prefixed names cPanel shows you —
   they'll look like `cpaneluser_easybills` and `cpaneluser_easybills`, not
   just `easybills`.

2. **Load the schema and seed data.** cPanel → **phpMyAdmin** → select your
   new database → **Import** tab → choose `database/schema.sql` → Go. Repeat
   for `database/seed.sql`. (Shared hosting rarely gives you SSH/mysql CLI
   access, so phpMyAdmin's Import tab is the way to do this here — the
   `mysql -u root ... < schema.sql` commands earlier in this README are for
   local development or a VPS with CLI access.)

3. **Upload the code.** Zip the project (excluding nothing — you need
   everything including the dot-files), then cPanel → **File Manager** →
   **Upload**, then **Extract** it. Where you extract it depends on which
   option you picked:
   - **Option A**: Create a subdomain first (cPanel → **Domains** →
     **Create A New Domain**, e.g. `api.yourdomain.com`) and set its
     **Document Root** directly to something like
     `api.yourdomain.com/easybills-backend/public`. Extract the project to
     `api.yourdomain.com/easybills-backend/` (i.e. one level above the
     document root you just set).
   - **Option B**: Extract directly into `public_html/` (or
     `public_html/api/` for an addon domain/subfolder).

4. **Set the PHP version.** cPanel → **MultiPHP Manager** → select your
   domain/subdomain → choose **PHP 8.1 or newer**.

5. **Enable required PHP extensions.** cPanel → **Select PHP Extensions**
   (sometimes part of MultiPHP Manager) → make sure `pdo_mysql`,
   `mbstring`, `curl`, and `json` are checked. Most cPanel PHP builds have
   these on by default, but it's worth confirming — a missing `mbstring`
   is exactly the kind of thing that works locally and breaks on a fresh
   host (it did during testing this backend).

6. **Edit `.env`.** In File Manager, open `.env` in the code editor and
   fill in:
   - `DB_HOST=localhost`, and the exact `DB_DATABASE` / `DB_USERNAME` /
     `DB_PASSWORD` cPanel gave you in step 1
   - `APP_URL` → your real subdomain URL
   - `CORS_ALLOWED_ORIGINS` → your frontend's real URL (Netlify/Vercel
     domain and/or your custom domain)
   - `EPINS_API_KEY` and confirmed `EPINS_*_BASE_URL` values
   - `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY`
   - Leave `APP_DEBUG=false` for a live site

7. **Test it.** Visit `https://api.yourdomain.com/api/v1/health` in a
   browser — you should see `{"status":"ok","time":"..."}`. If you get a
   500 error, cPanel → **Errors** (or **Metrics → Errors**) will usually
   show the PHP exception; with `APP_DEBUG=true` temporarily, the JSON
   error response itself will include the detail too.

8. **Point the frontend at it.** Set `NEXT_PUBLIC_API_URL` (or however
   you're configuring the frontend's API base) to
   `https://api.yourdomain.com`.

9. **Register the Paystack webhook.** Paystack Dashboard → Settings → API
   Keys & Webhooks → set the webhook URL to
   `https://api.yourdomain.com/api/v1/webhooks/paystack` (set this for
   both test and live mode, separately).

10. **File permissions.** cPanel's default upload permissions (usually
    `644` for files, `755` for folders) are fine as-is. The one folder that
    needs to be writable by PHP is `storage/logs/` (for the OTP dev-log) —
    if you see permission errors there, set it to `755` via File Manager's
    permissions dialog.

## Using Nginx instead of Apache

```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
location ~ \.php$ {
    fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    fastcgi_index index.php;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
```
Point the document root at `public/`.

## Security notes

- Passwords hashed with `password_hash()` (bcrypt)
- All queries use PDO prepared statements — no string-concatenated SQL
- JWTs are HMAC-SHA256 signed and expire (`JWT_TTL_MINUTES` /
  `JWT_ADMIN_TTL_MINUTES`)
- Wallet debit/credit operations use conditional `UPDATE` statements
  (`WHERE balance >= :amount`) so concurrent requests can't overdraw a
  wallet — no separate row locking needed
- CORS is locked to `CORS_ALLOWED_ORIGINS` (don't leave this as `*` in
  production)
- Sensitive admin actions are written to `audit_logs`

Not included, and worth adding before a real production launch: rate
limiting on auth endpoints, a token-blacklist table for real logout/session
revocation, request logging/monitoring, and automated tests.
