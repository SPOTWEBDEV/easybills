"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionListItem } from "@/components/dashboard/transaction-list-item";
import { useTransactions } from "@/hooks/use-transactions";

export default function WalletHistoryPage() {
  const [tab, setTab] = useState("all");
  const { data: transactions, isLoading } = useTransactions();

  const walletTxns = transactions?.filter(
    (t) => t.category === "wallet-funding" || t.category === "withdrawal"
  );
  const filtered = walletTxns?.filter((t) => {
    if (tab === "all") return true;
    if (tab === "funding") return t.category === "wallet-funding";
    return t.category === "withdrawal";
  });

  return (
    <AppShell>
      <PageHeader title="Wallet History" subtitle="All funding and withdrawal activity" />

      <div className="px-5 pt-2">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
            <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
          </TabsList>
          <TabsContent value={tab}>
            <div className="rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 px-2 py-1 shadow-soft">
              {isLoading || !filtered ? (
                <div className="space-y-2 p-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <p className="p-8 text-center text-sm text-ink-500 dark:text-paper-200/40">
                  No transactions found.
                </p>
              ) : (
                filtered.map((txn) => <TransactionListItem key={txn.id} transaction={txn} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
