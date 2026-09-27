"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionListItem } from "@/components/dashboard/transaction-list-item";
import { useTransactions } from "@/hooks/use-transactions";

export default function WalletHistoryPage() {
  const { data: transactions, isLoading } = useTransactions({ category: "wallet-funding" });

  return (
    <AppShell>
      <PageHeader title="Wallet History" subtitle="All wallet funding activity" />

      <div className="px-5 pt-2">
        <div className="rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 px-2 py-1 shadow-soft">
          {isLoading || !transactions ? (
            <div className="space-y-2 p-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-500 dark:text-paper-200/40">
              No wallet funding activity yet.
            </p>
          ) : (
            transactions.map((txn) => <TransactionListItem key={txn.id} transaction={txn} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}