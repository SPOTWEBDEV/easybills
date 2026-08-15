"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionListItem } from "@/components/dashboard/transaction-list-item";
import { useTransactions, useTransactionsSummary } from "@/hooks/use-transactions";
import { formatNaira } from "@/lib/utils";

export default function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "success" | "pending" | "failed">("all");
  const { data: transactions, isLoading } = useTransactions({ status, query });
  const { data: summary } = useTransactionsSummary();

  return (
    <AppShell>
      <TopBar title="Transactions" />

      <div className="space-y-5 px-5 pt-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 p-3.5 text-center shadow-soft">
            <p className="font-display text-base font-bold">{summary?.totalCount ?? "—"}</p>
            <p className="mt-0.5 text-[10px] text-ink-500 dark:text-paper-200/40">Transactions</p>
          </div>
          <div className="rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 p-3.5 text-center shadow-soft">
            <p className="font-display text-base font-bold">
              {summary ? formatNaira(summary.totalSpent, { compact: true }) : "—"}
            </p>
            <p className="mt-0.5 text-[10px] text-ink-500 dark:text-paper-200/40">Total spent</p>
          </div>
          <div className="rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 p-3.5 text-center shadow-soft">
            <p className="font-display text-base font-bold">{summary?.successRate ?? "—"}%</p>
            <p className="mt-0.5 text-[10px] text-ink-500 dark:text-paper-200/40">Success rate</p>
          </div>
        </div>

        <Input
          placeholder="Search by reference, title..."
          leftIcon={<Search className="h-4 w-4" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="success">Success</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 px-2 py-1 shadow-soft">
          {isLoading || !transactions ? (
            <div className="space-y-2 p-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="p-8 text-center text-sm text-ink-500 dark:text-paper-200/40">
              No transactions match your search.
            </p>
          ) : (
            transactions.map((txn) => <TransactionListItem key={txn.id} transaction={txn} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}
