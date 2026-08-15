import { useQuery } from "@tanstack/react-query";
import { transactionsApi, TransactionFilter } from "@/lib/api/transactions";

export function useTransactions(filter: TransactionFilter = {}) {
  return useQuery({
    queryKey: ["transactions", filter],
    queryFn: () => transactionsApi.list(filter),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
  });
}

export function useTransactionsSummary() {
  return useQuery({
    queryKey: ["transactions-summary"],
    queryFn: transactionsApi.summary,
  });
}
