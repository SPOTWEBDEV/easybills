// Web port of the mobile app's lib/api/*. Auth paths are copied from the app.
// All paths are copied from the mobile app's lib/api/*.
import { apiFetch, downloadAuthed, unwrapList } from "@/lib/api-client";
import type { Transaction, User, Wallet } from "@/lib/types";

const device = () => (typeof navigator === "undefined" ? "Web" : `Web (${navigator.platform || "browser"})`);

type Session = { user: User; token: string; requiresPinSetup: boolean };
export type LoginResult =
  | { requiresTwoFactor: true; email: string }
  | ({ requiresTwoFactor: false } & Session);

export const authApi = {
  register: (input: { fullName: string; email: string; phone: string; password: string; referralCode?: string }) =>
    apiFetch<Session>("/api/v1/auth/register", { method: "POST", body: { ...input, device: device() }, auth: "none" }),

  async login(input: { email: string; password: string }): Promise<LoginResult> {
    const res = await apiFetch<{ requiresTwoFactor: true; email: string } | Session>("/api/v1/auth/login", {
      method: "POST", body: { ...input, device: device() }, auth: "none",
    });
    if ("requiresTwoFactor" in res && res.requiresTwoFactor) return { requiresTwoFactor: true, email: res.email };
    return { requiresTwoFactor: false, ...(res as Session) };
  },
  verifyLoginOtp: (input: { email: string; code: string }) =>
    apiFetch<Session>("/api/v1/auth/verify-login-otp", { method: "POST", body: { ...input, device: device() }, auth: "none" }),
  resendLoginOtp: (input: { email: string }) =>
    apiFetch<{ sent: true }>("/api/v1/auth/resend-login-otp", { method: "POST", body: input, auth: "none" }),
  forgotPassword: (input: { email: string }) =>
    apiFetch<{ sent: true }>("/api/v1/auth/forgot-password", { method: "POST", body: input, auth: "none" }),
  resetPassword: (input: { email: string; code: string; password: string }) =>
    apiFetch<{ reset: true }>("/api/v1/auth/reset-password", { method: "POST", body: input, auth: "none" }),
  logout: () => apiFetch<{ success: true }>("/api/v1/auth/logout", { method: "POST" }),
  me: () => apiFetch<{ user: User; requiresPinSetup: boolean }>("/api/v1/auth/me"),
};

export const walletApi = {
  get: () => apiFetch<Wallet>("/api/v1/wallet"),
  /** Starts a Paystack checkout. The wallet is credited by Paystack's webhook, not by this call. */
  fundInitialize: (b: { amount: number; callbackUrl: string; transactionPin?: string }) =>
    apiFetch<{ authorizationUrl: string; accessCode: string; reference: string }>("/api/v1/wallet/fund/initialize", { method: "POST", body: b }),
};

export type TransactionsSummary = { count?: number; totalSpent?: number; successRate?: number };

// ⚠️ Transaction::summaryForUser wasn't shared, so the key names below are the likely ones.
// successRate is read as a PERCENTAGE (13.5 = 13.5%). Once you send summaryForUser, replace this with exact keys.
function normalizeSummary(raw: unknown): TransactionsSummary {
  const root = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const o = (root.data && typeof root.data === "object" ? root.data : root) as Record<string, unknown>;
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = o[k];
      const n = typeof v === "string" ? Number(v) : v;
      if (typeof n === "number" && Number.isFinite(n)) return n;
    }
    return undefined;
  };
  return {
    count: pick("totalTransactions", "transactionCount", "transactions", "count", "total", "total_transactions"),
    totalSpent: pick("totalSpent", "total_spent", "spent", "totalAmount", "total_amount"),
    successRate: pick("successRate", "success_rate", "successPercentage", "success_percentage", "rate"),
  };
}

export const transactionsApi = {
  list: async (q?: { status?: string; category?: string; query?: string }): Promise<Transaction[]> =>
    unwrapList(await apiFetch<{ data: Transaction[] }>("/api/v1/transactions", { query: q })),
  /** GET /api/v1/transactions/summary. Field names are matched tolerantly (see normalizeSummary);
   * anything it can't find comes back undefined so the caller can fall back. */
  summary: async (): Promise<TransactionsSummary> => normalizeSummary(await apiFetch<unknown>("/api/v1/transactions/summary")),
  get: (id: string) => apiFetch<Transaction>(`/api/v1/transactions/${encodeURIComponent(id)}`),
  downloadStatement: (q: { from: string; to: string }) =>
    downloadAuthed("/api/v1/statement.csv", `easybills-statement-${q.from}-to-${q.to}.csv`, q),
};

export type ReferralSummary = { referralCode: string; rewardPerReferral: number; totalInvites: number; totalEarned: number };
export type ReferralItem = { id: string; name: string; date: string; amount: number | null; status: "earned" | "pending" };
export const referralsApi = {
  summary: () => apiFetch<ReferralSummary>("/api/v1/referrals/summary"),
  history: async (): Promise<ReferralItem[]> => unwrapList(await apiFetch<{ data: ReferralItem[] }>("/api/v1/referrals/history")),
};

export type Provider = { id: string; name: string; color?: string; logoInitial?: string };
type Tx = { transaction: Transaction };

// ---------------- Security (paths from the mobile app) ----------------
export const securityApi = {
  changePassword: (b: { currentPassword: string; newPassword: string }) =>
    apiFetch<{ success: true }>("/api/v1/security/change-password", { method: "POST", body: b }),
  /** currentPin is only required if the account already has a PIN. */
  setTransactionPin: (b: { pin: string; currentPin?: string }) =>
    apiFetch<{ success: true }>("/api/v1/security/transaction-pin", { method: "POST", body: b }),
  verifyTransactionPin: (b: { pin: string }) =>
    apiFetch<{ valid: true }>("/api/v1/security/transaction-pin/verify", { method: "POST", body: b }),
  setTwoFactor: (b: { enabled: boolean }) =>
    apiFetch<{ success: true; twoFactorEnabled: boolean }>("/api/v1/security/two-factor", { method: "POST", body: b }),
};

// ---------------- Notifications ----------------
export type NotificationType = "transaction" | "referral" | "announcement" | "general";
export type AppNotification = { id: string; type: NotificationType; title: string; body: string; read: boolean; createdAt: string };
export const notificationsApi = {
  list: async (q: { perPage?: number } = {}): Promise<AppNotification[]> =>
    unwrapList(await apiFetch<{ data: AppNotification[] }>("/api/v1/notifications", { query: q })),
  unreadCount: () => apiFetch<{ count: number }>("/api/v1/notifications/unread-count"),
  markRead: (id: string) => apiFetch<{ success: true }>(`/api/v1/notifications/${id}/read`, { method: "POST" }),
  markAllRead: () => apiFetch<{ success: true; updated: number }>("/api/v1/notifications/read-all", { method: "POST" }),
};

// ---------------- Services (paths from the mobile app) ----------------
const providersOf = async (service: string): Promise<Provider[]> =>
  unwrapList(await apiFetch<{ data: Provider[] }>(`/api/v1/services/${service}/providers`, { auth: "none" }));

export const airtimeApi = {
  providers: () => providersOf("airtime"),
  purchase: (b: { providerId: string; phone: string; amount: number; transactionPin?: string }) =>
    apiFetch<Tx>("/api/v1/services/airtime/purchase", { method: "POST", body: b }),
};

export type DataPlan = { code: string; label?: string; size: string; validity: string; price: number; datatype?: string };
export const dataApi = {
  providers: () => providersOf("data"),
  plans: async (providerId: string): Promise<DataPlan[]> =>
    unwrapList(await apiFetch<{ data: DataPlan[] }>("/api/v1/services/data/plans", { auth: "none", query: { provider_id: providerId } })),
  purchase: (b: { providerId: string; planId: string; phone: string; transactionPin?: string }) =>
    apiFetch<Tx>("/api/v1/services/data/purchase", { method: "POST", body: b }),
};

export type MeterType = "prepaid" | "postpaid";
export const electricityApi = {
  providers: () => providersOf("electricity"),
  lookup: (b: { providerId: string; meterNumber: string; meterType: MeterType }) =>
    apiFetch<{ customerName: string; address: string }>("/api/v1/services/electricity/lookup", { method: "POST", body: b }),
  purchase: (b: { providerId: string; meterNumber: string; meterType: MeterType; amount: number; transactionPin?: string }) =>
    apiFetch<Tx & { token?: string }>("/api/v1/services/electricity/purchase", { method: "POST", body: b }),
};

export type Bouquet = { code: string; plancode?: string; name: string; validity: string; price: number };
export const cableApi = {
  providers: () => providersOf("cable"),
  bouquets: async (providerId: string): Promise<Bouquet[]> =>
    unwrapList(await apiFetch<{ data: Bouquet[] }>("/api/v1/services/cable/bouquets", { auth: "none", query: { provider_id: providerId } })),
  /** Not PIN-gated: no money moves. */
  lookup: (b: { providerId: string; smartcardNumber: string }) =>
    apiFetch<{ customerName: string }>("/api/v1/services/cable/lookup", { method: "POST", body: b }),
  purchase: (b: { providerId: string; bouquetId: string; smartcardNumber: string; transactionPin?: string }) =>
    apiFetch<Tx>("/api/v1/services/cable/purchase", { method: "POST", body: b }),
};

export type ExamVariation = { code: string; name: string; plancode: string; price: number; providerId: string };
export type ExamPinResult = { serial: string; pin: string } | { raw: string };
export const examPinsApi = {
  variations: async (service = "exams"): Promise<ExamVariation[]> =>
    unwrapList(await apiFetch<{ data: ExamVariation[] }>("/api/v1/services/exam-pins/variations", { auth: "none", query: { service } })),
  purchase: (b: { providerId: string; variationCode: string; quantity: number; amount?: number; transactionPin?: string }) =>
    apiFetch<Tx & { pins: ExamPinResult[] }>("/api/v1/services/exam-pins/purchase", {
      method: "POST",
      // Same as the app: the backend's legacy validator wants both fields.
      body: { ...b, network: b.providerId, providerId: b.providerId },
    }),
};

// ---------------- KYC (paths from the mobile app) ----------------
export type ApplicationStatus = "pending" | "approved" | "declined";
export type KycApplication = { status: ApplicationStatus; createdAt: string; declineReason?: string | null };
export type KycStatus = {
  tier: string; ninVerified: boolean; bvnVerified: boolean;
  ninApplication?: KycApplication | null; bvnApplication?: KycApplication | null;
  limits?: { maxWalletBalance: number; maxSingleTransaction: number; maxDailyTotal: number };
};
export const kycApi = {
  getStatus: () => apiFetch<KycStatus>("/api/v1/kyc/status"),
  /** Queues the NIN for admin review (doesn't change the tier). Resubmit to reapply. 5 submissions/hour. */
  verifyNin: (b: { nin: string; dateOfBirth: string }) =>
    apiFetch<{ message: string }>("/api/v1/kyc/verify-nin", { method: "POST", body: b }),
  /** Needs an already-approved NIN (Tier 2): the backend answers 422 otherwise. */
  verifyBvn: (b: { bvn: string }) =>
    apiFetch<{ message: string }>("/api/v1/kyc/verify-bvn", { method: "POST", body: b }),
};
