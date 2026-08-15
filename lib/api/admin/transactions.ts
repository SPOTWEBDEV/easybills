import { apiFetch, unwrapList } from "@/lib/api-client";

export interface AdminTransactionRow {
  id: string;
  reference: string;
  customer: string;
  service: string;
  amount: number;
  status: "success" | "pending" | "failed";
  date: string;
}

export const adminTransactionsApi = {
  async list(status?: string): Promise<AdminTransactionRow[]> {
    const res = await apiFetch<{ data: AdminTransactionRow[] }>("/api/v1/admin/transactions", {
      auth: "admin",
      query: { status },
    });
    return unwrapList(res);
  },
};
