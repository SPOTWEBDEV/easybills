import { apiFetch, unwrapList } from "@/lib/api-client";

export interface AdminWithdrawal {
  id: string;
  customer: string;
  amount: number;
  bank: string;
  accountNumber: string;
  requestedAt: string;
}

export const adminWithdrawalsApi = {
  async pending(): Promise<AdminWithdrawal[]> {
    const res = await apiFetch<{ data: AdminWithdrawal[] }>("/api/v1/admin/withdrawals/pending", { auth: "admin" });
    return unwrapList(res);
  },
  async approve(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/v1/admin/withdrawals/${id}/approve`, { method: "POST", auth: "admin" });
  },
  async reject(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/v1/admin/withdrawals/${id}/reject`, { method: "POST", auth: "admin" });
  },
};
