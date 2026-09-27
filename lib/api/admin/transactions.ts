import { apiFetch, unwrapList } from "@/lib/api-client";

export interface AdminTransactionRow {
  id: number;
  reference: string;
  category: string; // "electricity" | "cable" | "airtime" | "data" | "wallet-funding" | ...
  title: string; // e.g. "MTN Airtime", "GOtv GOtv Smallie"
  subtitle: string | null; // e.g. phone number, meter number
  amount: number;
  fee: number;
  status: "success" | "pending" | "failed";
  date: string; // "2026-09-22 10:51:19"
  provider: string | null;
  recipient: string | null;
  balanceAfter: number | null;
  customerName: string;
  customerEmail: string;
  failureReason: string | null;
}

export const adminTransactionsApi = {
  async list(status?: "all" | "success" | "pending" | "failed"): Promise<AdminTransactionRow[]> {
    const res = await apiFetch<{ data: AdminTransactionRow[] }>("/api/v1/admin/transactions", {
      auth: "admin",
      // "all" is a local UI-only value the backend doesn't understand —
      // it filters on an exact status match, so status=all matches zero
      // rows. Omit the param entirely to get every status.
      query: {
        status: status && status !== "all" ? status : undefined,
      },
    });
    return unwrapList(res);
  },
};