import { apiFetch, unwrapList } from "@/lib/api-client";

export type KYCTier = "tier1" | "tier2" | "tier3";
export type KYCApplicationType = "nin" | "bvn";
export type KYCApplicationStatus = "pending" | "approved" | "declined";

export interface KYCTierLimit {
  tier: KYCTier;
  maxWalletBalance: number;
  maxSingleTransaction: number;
  maxDailyTotal: number;
  updatedAt: string;
}

export interface KYCApplicationRow {
  id: string;
  type: KYCApplicationType;
  dateOfBirth: string;
  status: KYCApplicationStatus;
  declineReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface KYCApplicationDetail extends KYCApplicationRow {
  idNumber: string; // decrypted NIN/BVN — only ever exposed here, per the doc
  bureauSnapshot?: unknown; // optional best-effort provider lookup, shape not documented
  accountHolder: { fullName: string; email: string; phone: string };
}

export const adminKycApi = {
  // --- Tier limits ---
  async listTierLimits(): Promise<KYCTierLimit[]> {
    const res = await apiFetch<{ data: KYCTierLimit[] }>("/api/v1/admin/kyc/tier-limits", {
      auth: "admin",
    });
    return unwrapList(res);
  },

  // super_admin only — PUT returns 403 for a regular admin token
  async updateTierLimit(
    tier: KYCTier,
    limits: { maxWalletBalance: number; maxSingleTransaction: number; maxDailyTotal: number }
  ): Promise<void> {
    await apiFetch(`/api/v1/admin/kyc/tier-limits/${tier}`, {
      method: "PUT",
      auth: "admin",
      body: limits,
    });
  },

  // --- Application review ---
  async listApplications(filters?: {
    status?: KYCApplicationStatus | "all";
    type?: KYCApplicationType | "all";
  }): Promise<KYCApplicationRow[]> {
    const res = await apiFetch<{ data: KYCApplicationRow[] }>("/api/v1/admin/kyc/applications", {
      auth: "admin",
      query: {
        status: filters?.status && filters.status !== "all" ? filters.status : undefined,
        type: filters?.type && filters.type !== "all" ? filters.type : undefined,
      },
    });
    return unwrapList(res);
  },

  // Object response, not a list envelope — every call is audit-logged
  // server-side because it exposes the decrypted idNumber.
  async getApplication(id: string): Promise<KYCApplicationDetail> {
    return apiFetch<KYCApplicationDetail>(`/api/v1/admin/kyc/applications/${id}`, {
      auth: "admin",
    });
  },

  async approveApplication(id: string): Promise<{ success: true; tier: string }> {
    return apiFetch(`/api/v1/admin/kyc/applications/${id}/approve`, {
      method: "POST",
      auth: "admin",
    });
  },

  // reason is REQUIRED, 3-255 chars, shown verbatim to the customer
  async declineApplication(id: string, reason: string): Promise<void> {
    await apiFetch(`/api/v1/admin/kyc/applications/${id}/decline`, {
      method: "POST",
      auth: "admin",
      body: { reason },
    });
  },
};