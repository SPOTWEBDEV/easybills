"use client";
import Link from "next/link";
import { Bell, ChevronRight, CloudOff, Gift, Receipt } from "lucide-react";
import { Avatar } from "@/components/dashboard/avatar";
import { IconBtn, ThemeToggle } from "@/components/dashboard/theme-toggle";
import { WalletCard } from "@/components/dashboard/wallet-card";
import { TransactionRow } from "@/components/dashboard/transaction-row";
import { useAuth } from "@/components/dashboard/auth-context";
import { useApiData } from "@/hooks/use-api-data";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { transactionsApi, walletApi } from "@/lib/api/dashboard";
import { QUICK_ACTIONS } from "@/components/dashboard/services";

export default function HomePage() {
  const { user } = useAuth();
  const wallet = useApiData(() => walletApi.get());
  const recentTx = useApiData(() => transactionsApi.list());
  const unread = useUnreadCount();
  const recent = (recentTx.data ?? []).slice(0, 5);
  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={user?.fullName ?? "?"} />
          <div>
            <p className="text-xs text-[rgb(var(--fg-muted))]">Welcome back,</p>
            <p className="font-bold">{firstName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <Link href="/dashboard/notifications"><IconBtn label="Notifications" dot={unread > 0}><Bell className="h-[18px] w-[18px]" /></IconBtn></Link>
        </div>
      </header>

      {/* Mobile: one column. Desktop: actions on the left, recent activity on the right. */}
      <div className="grid gap-6 lg:grid-cols-5 lg:items-start lg:gap-8">
        <div className="space-y-6 lg:col-span-3">
          <WalletCard balance={wallet.data?.balance ?? 0} cashback={wallet.data?.cashback ?? 0} loading={wallet.loading} />
          {wallet.error && <p className="text-xs text-red-500">Couldn&apos;t load your balance. Refresh the page to retry.</p>}

          <Link href="/dashboard/profile/referrals" className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-500 p-4 text-white">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20"><Gift className="h-[18px] w-[18px]" /></span>
            <p className="flex-1 text-[13px] font-semibold leading-snug">Refer a friend and earn ₦500 cashback when they make their first purchase.</p>
            <ChevronRight className="h-4 w-4" />
          </Link>

          <section>
            <h2 className="mb-3 font-display text-base font-bold">Quick actions</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {QUICK_ACTIONS.map(({ key, label, icon: Icon, tint, bg, href, comingSoon }) => {
                const body = (
                  <>
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${bg}`}><Icon className={`h-5 w-5 ${tint}`} /></span>
                    <span className="text-xs font-semibold">{label}</span>
                    {comingSoon && <span className="text-[10px] font-bold text-amber-500">Coming soon</span>}
                  </>
                );
                const cls = "flex flex-col items-center gap-2.5 rounded-2xl border bg-[rgb(var(--bg-elevated))] py-5";
                return comingSoon
                  ? <div key={key} aria-disabled="true" className={`${cls} opacity-60`}>{body}</div>
                  : <Link key={key} href={href} className={`${cls} transition-colors hover:border-brand-500/50`}>{body}</Link>;
              })}
            </div>
          </section>
        </div>

        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Recent transactions</h2>
            <Link href="/dashboard/history" className="text-sm font-bold text-brand-500">View all</Link>
          </div>
          {recentTx.loading ? (
            <p className="py-10 text-center text-sm text-[rgb(var(--fg-muted))]">Loading…</p>
          ) : recentTx.error ? (
            <Empty icon={<CloudOff className="h-7 w-7" />} text="Couldn't load transactions" />
          ) : recent.length === 0 ? (
            <Empty icon={<Receipt className="h-7 w-7" />} text="No transactions yet" />
          ) : (
            <div className="space-y-3">{recent.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}</div>
          )}
        </section>
      </div>
    </div>
  );
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-[rgb(var(--fg-muted))]">
      {icon}<p className="text-sm">{text}</p>
    </div>
  );
}
