import { apiFetch, unwrapList } from "@/lib/api-client";

export interface AdminProviderRow {
  id: string;
  name: string;
  type: "network" | "electricity" | "cable" | string;
  status: "active" | "inactive";
}

export const adminProvidersApi = {
  async list(): Promise<AdminProviderRow[]> {
    const res = await apiFetch<{ data: AdminProviderRow[] }>("/api/v1/admin/providers", { auth: "admin" });
    return unwrapList(res);
  },
  /** Live check of the airtime/data/bills provider; `raw` includes its balance. */
  async epinsStatus(): Promise<{ connected: boolean; raw?: unknown; error?: string }> {
    return apiFetch("/api/v1/admin/providers/epins-status", { auth: "admin" });
  },
  /** Gift-card provider wallet, e.g. { balance: 1234.5, currencyCode: "USD" } or { error }. */
  async reloadlyBalance(): Promise<{ balance?: number; currencyCode?: string; error?: string }> {
    return apiFetch("/api/v1/admin/reloadly/balance", { auth: "admin" });
  },
};
