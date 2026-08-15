"use client";

import Link from "next/link";
import { Plus, ArrowUpRight, Copy, History, FileSpreadsheet, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { NotchCard } from "@/components/shared/notch-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionListItem } from "@/components/dashboard/transaction-list-item";
import { useWallet } from "@/hooks/use-wallet";
import { useTransactions } from "@/hooks/use-transactions";
import { formatNaira } from "@/lib/utils";

export default function WalletPage() {
  const { data: wallet, isLoading } = useWallet();
  const { data: transactions } = useTransactions();

  const walletTxns = transactions?.filter(
    (t) => t.category === "wallet-funding" || t.category === "withdrawal"
  );

  const copyAccount = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.accountNumber);
    toast.success("Account number copied");
  };

  return (
    <AppShell>
      <PageHeader title="Wallet" subtitle="Manage your EasyBills balance" />

      <div className="space-y-6 px-5 pt-2">
        {isLoading || !wallet ? (
          <Skeleton className="h-40 w-full rounded-3xl" />
        ) : (
          <NotchCard perforateAt="60%" className="bg-brand-mesh text-white shadow-glow">
            <div className="px-6 pt-6 pb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Available balance</p>
              <p className="mt-2 font-display text-3xl font-bold">{formatNaira(wallet.balance)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 px-4 pb-5 pt-3">
              <Link
                href="/wallet/fund"
                className="flex items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" /> Fund
              </Link>
              <Link
                href="/wallet/withdraw"
                className="flex items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 text-sm font-semibold"
              >
                <ArrowUpRight className="h-4 w-4" /> Withdraw
              </Link>
            </div>
          </NotchCard>
        )}

        {wallet && (
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40">
              Your dedicated virtual account
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-bold tabular-nums">{wallet.accountNumber}</p>
                <p className="text-sm text-ink-600 dark:text-paper-200/60">
                  {wallet.bankName} &middot; {wallet.accountName}
                </p>
              </div>
              <button
                onClick={copyAccount}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800"
                aria-label="Copy account number"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-ink-500 dark:text-paper-200/40">
              Transfer any amount here and your wallet updates instantly.
            </p>
          </Card>
        )}

        <Link
          href="/statement"
          className="flex items-center gap-3.5 rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 p-4 shadow-soft transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/60"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300">
            <FileSpreadsheet className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Statement of account</p>
            <p className="text-xs text-ink-600 dark:text-paper-200/50">Download your activity as CSV</p>
          </div>
        </Link>

        <Link
          href="/wallet/payment-methods"
          className="flex items-center gap-3.5 rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 p-4 shadow-soft transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/60"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
            <CreditCard className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Payment methods</p>
            <p className="text-xs text-ink-600 dark:text-paper-200/50">Manage cards and bank details</p>
          </div>
        </Link>

        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-ink-600 dark:text-paper-200/60">Wallet activity</h2>
            <Link href="/wallet/history" className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
              <History className="h-3.5 w-3.5" /> Full history
            </Link>
          </div>
          <div className="rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 px-2 py-1 shadow-soft">
            {!walletTxns ? (
              <div className="space-y-2 p-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : walletTxns.length === 0 ? (
              <p className="p-6 text-center text-sm text-ink-500 dark:text-paper-200/40">
                No wallet activity yet.
              </p>
            ) : (
              walletTxns.slice(0, 5).map((txn) => <TransactionListItem key={txn.id} transaction={txn} />)
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
