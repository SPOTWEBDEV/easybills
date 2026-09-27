import { apiFetch, unwrapList, downloadAuthed } from "@/lib/api-client";
import { Transaction, TransactionStatus, TransactionCategory } from "@/lib/types";

export interface TransactionFilter {
  status?: TransactionStatus | "all";
  category?: TransactionCategory | "all";
  query?: string;
}

export const transactionsApi = {
  async list(filter: TransactionFilter = {}): Promise<Transaction[]> {
    const res = await apiFetch<{ data: Transaction[] }>("/api/v1/transactions", {
      query: {
        status: filter.status && filter.status !== "all" ? filter.status : undefined,
        category: filter.category && filter.category !== "all" ? filter.category : undefined,
        query: filter.query,
      },
    });
    return unwrapList(res);
  },

  async getById(id: string): Promise<Transaction | undefined> {
    try {
      return await apiFetch<Transaction>(`/api/v1/transactions/${encodeURIComponent(id)}`);
    } catch {
      return undefined;
    }
  },

  async summary(): Promise<{ totalSpent: number; totalCount: number; successRate: number }> {
    return apiFetch("/api/v1/transactions/summary");
  },

  /** Downloads a real backend-generated CSV statement for the given date range. */
  async downloadStatement(from: string, to: string): Promise<void> {
    await downloadAuthed("/api/v1/statement.csv", `easybills-statement-${from}-to-${to}.csv`, { from, to });
  },
};
