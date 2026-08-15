import { apiFetch, unwrapList } from "@/lib/api-client";

export interface AdminProviderRow {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive";
}

export const adminProvidersApi = {
  async list(): Promise<AdminProviderRow[]> {
    const res = await apiFetch<{ data: AdminProviderRow[] }>("/api/v1/admin/providers", { auth: "admin" });
    return unwrapList(res);
  },
  async epinsStatus(): Promise<{ connected: boolean; raw?: unknown; error?: string }> {
    return apiFetch("/api/v1/admin/providers/epins-status", { auth: "admin" });
  },
};
