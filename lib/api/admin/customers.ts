import { apiFetch, unwrapList } from "@/lib/api-client";
import { AdminCustomer } from "@/lib/mock-data/admin";

export const adminCustomersApi = {
  async list(): Promise<AdminCustomer[]> {
    const res = await apiFetch<{ data: AdminCustomer[] }>("/api/v1/admin/customers", { auth: "admin" });
    return unwrapList(res);
  },
  async suspend(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/v1/admin/customers/${id}/suspend`, { method: "POST", auth: "admin" });
  },
  async reactivate(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/v1/admin/customers/${id}/reactivate`, { method: "POST", auth: "admin" });
  },
};
