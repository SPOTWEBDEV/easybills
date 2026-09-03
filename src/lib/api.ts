import type {
  AdminBroadcast,
  AdminUser,
  Customer,
  CustomerDetail,
  DashboardStats,
  Product,
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

  constructor(message: string, status: number, fields?: Record<string, string>, sessionExpired?: boolean) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.fields = fields;
    this.sessionExpired = sessionExpired;
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
      body?.sessionExpired
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

export function suspendCustomer(id: number | string) {
  return request<{ success: boolean }>(`/admin/customers/${id}/suspend`, { method: "POST" });
}

export function reactivateCustomer(id: number | string) {
  return request<{ success: boolean }>(`/admin/customers/${id}/reactivate`, { method: "POST" });
}

// ---- Transactions ----

export function getAdminTransactions(status?: string) {
  const qs = status && status !== "all" ? `?status=${status}` : "";
  return request<{ data: Transaction[] }>(`/admin/transactions${qs}`);
}

// ---- Products / pricing / providers ----

export function getProducts() {
  return request<{ data: Product[] }>("/admin/products");
}

export function toggleProductStatus(id: number | string) {
  return request<{ success: boolean }>(`/admin/products/${id}/toggle-status`, { method: "POST" });
}

export function syncDataPlans() {
  return request<{ success: boolean }>("/admin/products/sync-data-plans", { method: "POST" });
}

export function getPricing() {
  return request<{ data: PricingRule[] }>("/admin/pricing");
}

export function updatePricing(id: number | string, body: { marginType: string; marginValue: number }) {
  return request<{ success: boolean }>(`/admin/pricing/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function getProviders() {
  return request<{ data: Provider[] }>("/admin/providers");
}

export function getEpinsStatus() {
  return request<{ connected: boolean; raw?: unknown; error?: string }>("/admin/providers/epins-status");
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
