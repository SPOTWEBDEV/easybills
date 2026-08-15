import { apiFetch, unwrapList } from "@/lib/api-client";

export interface AdminProductRow {
  id: string;
  name: string;
  category: string;
  provider: string;
  costPrice: number;
  sellPrice: number;
  status: "active" | "inactive";
}

export const adminProductsApi = {
  async list(): Promise<AdminProductRow[]> {
    const res = await apiFetch<{ data: AdminProductRow[] }>("/api/v1/admin/products", { auth: "admin" });
    return unwrapList(res);
  },
  async toggleStatus(id: string): Promise<{ status: string }> {
    return apiFetch(`/api/v1/admin/products/${id}/toggle-status`, { method: "POST", auth: "admin" });
  },
};
