import { apiFetch, unwrapList } from "@/lib/api-client";

export interface AdminPricingRow {
  id: string;
  service: string;
  marginType: "fixed" | "percentage";
  marginValue: number;
  updatedAt: string;
}

export const adminPricingApi = {
  async list(): Promise<AdminPricingRow[]> {
    const res = await apiFetch<{ data: AdminPricingRow[] }>("/api/v1/admin/pricing", { auth: "admin" });
    return unwrapList(res);
  },
  async update(id: string, marginType: "fixed" | "percentage", marginValue: number): Promise<{ success: boolean }> {
    return apiFetch(`/api/v1/admin/pricing/${id}`, {
      method: "PUT",
      auth: "admin",
      body: { marginType, marginValue },
    });
  },
};
