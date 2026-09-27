import { apiFetch, unwrapList } from "@/lib/api-client";

// List shape per GET /admin/customers — NOTE: unconfirmed against a real
// response. The detail endpoint below uses fullName/createdAt instead of
// name/joinedAt, so this list type may have the same mismatch — confirm
// with a real /admin/customers response and correct if so.
export interface AdminCustomerRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  tier: string;
  kycStatus: string;
  status: "active" | "suspended";
  suspensionReason: string | null;
  joinedAt: string;
}

// Recent transaction as embedded in the customer detail response — same
// shape as the main transactions list, minus the per-customer fields
// (redundant here since it's scoped to one customer already).
export interface CustomerRecentTransaction {
  id: number;
  reference: string;
  category: string;
  title: string;
  subtitle: string | null;
  amount: number;
  fee: number;
  status: "success" | "pending" | "failed";
  date: string;
  provider: string | null;
  recipient: string | null;
  balanceAfter: number | null;
  failureReason?: string | null; // present on the main list; confirm it's here too
}

// Matches the real GET /admin/customers/{id} response exactly.
export interface AdminCustomerDetail {
  user: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    avatarInitials: string;
    kycStatus: string;
    tier: string; // e.g. "Tier 2" — a display string, not "tier2"
    ninVerified: boolean;
    bvnVerified: boolean;
    referralCode: string;
    hasTransactionPin: boolean;
    twoFactorEnabled: boolean;
    status: "active" | "suspended";
    suspensionReason: string; // empty string when not suspended, not null
    createdAt: string;
  };
  wallet: {
    balance: number;
    cashback: number;
  };
  recentTransactions: CustomerRecentTransaction[];
}

export const adminCustomersApi = {
  async list(): Promise<AdminCustomerRow[]> {
    const res = await apiFetch<{ data: AdminCustomerRow[] }>("/api/v1/admin/customers", {
      auth: "admin",
    });
    return unwrapList(res);
  },

  async get(id: string | number): Promise<AdminCustomerDetail> {
    return apiFetch<AdminCustomerDetail>(`/api/v1/admin/customers/${id}`, {
      auth: "admin",
    });
  },

  // reason is REQUIRED, 3-255 chars — written to the audit log and shown
  // to the customer on their next login attempt
  async suspend(id: string | number, reason: string): Promise<void> {
    await apiFetch(`/api/v1/admin/customers/${id}/suspend`, {
      method: "POST",
      auth: "admin",
      body: { reason },
    });
  },

  async reactivate(id: string | number): Promise<void> {
    await apiFetch(`/api/v1/admin/customers/${id}/reactivate`, {
      method: "POST",
      auth: "admin",
    });
  },
};