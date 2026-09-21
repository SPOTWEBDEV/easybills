import type {
  AdminBroadcast,
  AdminFlightBooking,
  AdminUser,
  Customer,
  CustomerDetail,
  DashboardStats,
  EpinsStatus,
  FxRate,
  GiftCardBrand,
  GiftCardSellTrade,
  GiftCardStockItem,
  KycApplication,
  KycApplicationDetail,
  KycTierLimit,
  PricingRule,
  Provider,
  ReferralProgram,
  RevenueTrendPoint,
  TopService,
  Transaction,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.easybills-app.top/api/v1";

const TOKEN_KEY = "easybills_admin_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiRequestError extends Error {
  status: number;
  fields?: Record<string, string>;
  sessionExpired?: boolean;
  tierLimitExceeded?: boolean;

  constructor(
    message: string,
    status: number,
    fields?: Record<string, string>,
    sessionExpired?: boolean,
    tierLimitExceeded?: boolean
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.fields = fields;
    this.sessionExpired = sessionExpired;
    this.tierLimitExceeded = tierLimitExceeded;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getStoredToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: finalHeaders });
  } catch (err) {
    throw new ApiRequestError(
      "Couldn't reach the EasyBills API. Check your connection or the API base URL.",
      0
    );
  }

  const isCsv = res.headers.get("content-type")?.includes("text/csv");
  if (isCsv) return (await res.text()) as unknown as T;

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok || body?.error) {
    if (res.status === 401 && body?.sessionExpired) {
      clearStoredToken();
    }
    throw new ApiRequestError(
      body?.error || `Request failed (${res.status})`,
      res.status,
      body?.fields,
      body?.sessionExpired,
      body?.tierLimitExceeded
    );
  }

  return body as T;
}

// ---- Admin auth ----

export function adminLogin(email: string, password: string) {
  return request<{ admin: AdminUser; token: string }>("/admin/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });
}

export function getAdminMe() {
  return request<{ admin: AdminUser }>("/admin/auth/me");
}

// ---- Dashboard ----

export function getDashboardStats() {
  return request<DashboardStats>("/admin/dashboard/stats");
}

export function getRevenueTrend() {
  return request<{ data: RevenueTrendPoint[] }>("/admin/dashboard/revenue-trend");
}

export function getTopServices() {
  return request<{ data: TopService[] }>("/admin/dashboard/top-services");
}

// ---- Customers ----

export function getCustomers() {
  return request<{ data: Customer[] }>("/admin/customers");
}

export function getCustomer(id: number | string) {
  return request<CustomerDetail>(`/admin/customers/${id}`);
}

// Suspending now requires a reason (3-255 chars) — it's written to the audit
// log and shown to the customer on their next login attempt.
export function suspendCustomer(id: number | string, reason: string) {
  return request<{ success: boolean }>(`/admin/customers/${id}/suspend`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function reactivateCustomer(id: number | string) {
  return request<{ success: boolean }>(`/admin/customers/${id}/reactivate`, { method: "POST" });
}

// ---- Transactions ----

export function getAdminTransactions(status?: string) {
  const qs = status && status !== "all" ? `?status=${status}` : "";
  return request<{ data: Transaction[] }>(`/admin/transactions${qs}`);
}

// ---- Providers ----
// Check epins-status FIRST whenever airtime/data/electricity/cable/exam-pin
// purchases start failing broadly — it isolates a credentials/connectivity
// problem before you need to dig into individual transaction failureReasons.

export function getProviders() {
  return request<{ data: Provider[] }>("/admin/providers");
}

export function getEpinsStatus() {
  return request<EpinsStatus>("/admin/providers/epins-status");
}

// ---- Pricing (profit margins) ----
// Categories: airtime, data, electricity, cable, exam-pin, flight,
// gift-card. Each applies its margin differently — see the Pricing page.

export function getPricing() {
  return request<{ data: PricingRule[] }>("/admin/pricing");
}

export function updatePricing(id: number | string, body: { marginType: string; marginValue: number }) {
  return request<{ success: boolean }>(`/admin/pricing/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ---- Referral program ----

export function getReferralProgram() {
  return request<ReferralProgram>("/admin/referral-program");
}

export function updateReferralSettings(body: { referrerReward: number; referredReward: number }) {
  return request<{ success: boolean }>("/admin/referral-program/settings", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ---- Notifications / broadcasts ----
// Admin-side only: sending an announcement to users (push or email). There is
// no admin notification inbox or FCM device registration here — that's a
// mobile-app-only concern (the admin dashboard runs in a browser, not as an
// app with a push-capable OS session).

export function getAdminBroadcasts() {
  return request<{ data: AdminBroadcast[] }>("/admin/notifications");
}

export function sendAdminBroadcast(body: {
  title: string;
  body: string;
  channel: "push" | "email";
  audience: "all" | "new_users";
}) {
  return request<{ id: number; sentTo: number }>("/admin/notifications", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ---- Gift cards ----
// Buy direction: admin-sourced stock, purchased instantly by the customer.
// Sell direction: verified and paid out automatically by Sogo Africa via
// webhook — admin no longer sets a sell rate/toggle per brand, and there is
// no approve/reject step; the sell-trades list below is read-only oversight.

export function getGiftCardBrands() {
  return request<{ data: GiftCardBrand[] }>("/admin/giftcards/brands");
}

export function createGiftCardBrand(body: { id: string; name: string; buyEnabled?: boolean }) {
  return request<{ id: string }>("/admin/giftcards/brands", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateGiftCardBrand(
  id: string,
  body: { buyEnabled?: boolean; status?: "active" | "inactive" }
) {
  return request<{ success: boolean }>(`/admin/giftcards/brands/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function getGiftCardStock(brandId: string) {
  return request<{ data: GiftCardStockItem[] }>(
    `/admin/giftcards/stock?brand_id=${encodeURIComponent(brandId)}`
  );
}

export function addGiftCardStock(body: {
  brandId: string;
  denominationAmount: number;
  price: number;
  items: { code: string; pin?: string }[];
}) {
  return request<{ added: number }>("/admin/giftcards/stock", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getGiftCardSellTrades(status?: string) {
  const qs = status && status !== "all" ? `?status=${status}` : "";
  return request<{ data: GiftCardSellTrade[] }>(`/admin/giftcards/sell-trades${qs}`);
}

// ---- Flights (Duffel) ----
// This backend never charges in whatever currency Duffel quotes an offer in
// — every price is converted to NGN using an admin-set FX rate before
// anything is shown or charged. Keeping those rates current is what makes
// flight pricing accurate; see the FX Rates panel. The flight markup itself
// is set from the Pricing page (the "flight" row), not here.

export function getAdminFlightBookings(status?: string) {
  const qs = status && status !== "all" ? `?status=${status}` : "";
  return request<{ data: AdminFlightBooking[] }>(`/admin/flights/bookings${qs}`);
}

export function getFxRates() {
  return request<{ data: FxRate[] }>("/admin/fx-rates");
}

export function updateFxRate(currency: string, rateToNgn: number) {
  return request<{ success: boolean }>(`/admin/fx-rates/${currency}`, {
    method: "PUT",
    body: JSON.stringify({ rateToNgn }),
  });
}

// ---- KYC ----
// Tier upgrades are admin-reviewed: a submitted NIN/BVN sits pending until
// an admin approves (tier changes immediately) or declines (with a reason
// shown verbatim to the user) it. Tier limits are unchanged from before.

export function getKycApplications(status?: string, type?: string) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (type && type !== "all") params.set("type", type);
  const qs = params.toString();
  return request<{ data: KycApplication[] }>(`/admin/kyc/applications${qs ? `?${qs}` : ""}`);
}

// The only endpoint that ever reveals the decrypted NIN/BVN — every call is
// written to the audit log.
export function getKycApplicationDetail(id: number | string) {
  return request<KycApplicationDetail>(`/admin/kyc/applications/${id}`);
}

export function approveKycApplication(id: number | string) {
  return request<{ success: boolean; tier: string }>(`/admin/kyc/applications/${id}/approve`, {
    method: "POST",
  });
}

export function declineKycApplication(id: number | string, reason: string) {
  return request<{ success: boolean }>(`/admin/kyc/applications/${id}/decline`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function getKycTierLimits() {
  return request<{ data: KycTierLimit[] }>("/admin/kyc/tier-limits");
}

export function updateKycTierLimit(
  tier: string,
  body: { maxWalletBalance: number; maxSingleTransaction: number; maxDailyTotal: number }
) {
  return request<{ success: boolean }>(`/admin/kyc/tier-limits/${tier}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
