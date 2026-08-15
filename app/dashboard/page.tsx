"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Gift } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TransactionListItem } from "@/components/dashboard/transaction-list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/hooks/use-wallet";
import { useTransactions } from "@/hooks/use-transactions";
import { useCurrentUser } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: user } = useCurrentUser();

  return (
    <AppShell>
      <TopBar user={user} />

      <div className="space-y-6 px-5 pt-4">
        {walletLoading || !wallet ? (
          <Skeleton className="h-52 w-full rounded-3xl" />
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <BalanceCard wallet={wallet} />
          </motion.div>
        )}

        <Link href="/referrals">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex items-center gap-3 overflow-hidden rounded-2xl bg-accent-mesh px-4 py-3 text-white transition-transform active:scale-[0.98]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/25">
              <Gift className="h-4 w-4" />
            </span>
            <p className="flex-1 text-xs font-semibold leading-snug">
              Refer a friend and earn ₦500 cashback when they make their first purchase.
            </p>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-80" />
          </motion.div>
        </Link>

        <div>
          <h2 className="mb-3 px-1 text-sm font-semibold text-ink-600 dark:text-paper-200/60">
            Quick actions
          </h2>
          <QuickActions />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-ink-600 dark:text-paper-200/60">
              Recent transactions
            </h2>
            <Link
              href="/transactions"
              className="flex items-center text-xs font-semibold text-brand-600 dark:text-brand-400"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 px-2 py-1 shadow-soft">
            {txLoading || !transactions ? (
              <div className="space-y-2 p-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              transactions
                .slice(0, 5)
                .map((txn) => <TransactionListItem key={txn.id} transaction={txn} />)
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
