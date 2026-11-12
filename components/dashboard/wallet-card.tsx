"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Plus, Sparkles } from "lucide-react";
import { formatNaira } from "@/lib/utils";

// Web version of the app's "tap to scratch & reveal" wallet card.
export function WalletCard({
  balance, cashback, loading,
}: { balance: number; cashback: number; loading?: boolean }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-[rgb(var(--bg-elevated))] to-emerald-500/10 p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">
          <Sparkles className="h-4 w-4 text-brand-500" /> Wallet balance
        </p>
        <button
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide balance" : "Reveal balance"}
          className="text-[rgb(var(--fg-muted))] hover:text-brand-500"
        >
          {revealed ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>
      </div>

      <button
        onClick={() => setRevealed(true)}
        disabled={revealed}
        className="relative mt-5 block w-full text-left"
      >
        {loading ? (
          <span className="block h-10 w-48 animate-pulse rounded-lg bg-ink-200/40 dark:bg-ink-700/50" />
        ) : revealed ? (
          <span className="font-display text-4xl font-bold">{formatNaira(balance)}</span>
        ) : (
          <span className="scratch-shimmer font-display text-xl font-bold uppercase tracking-wide text-[rgb(var(--fg-muted))]/70">
            Tap to scratch &amp; reveal
          </span>
        )}
      </button>

      <p className="mt-3 text-sm text-[rgb(var(--fg-muted))]">
        Cashback earned: {revealed ? formatNaira(cashback) : "₦••••"}
      </p>

      <Link
        href="/dashboard/fund-wallet"
        className="mt-5 inline-flex items-center gap-3 text-sm font-bold"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900/10 dark:bg-white/10">
          <Plus className="h-4 w-4" />
        </span>
        Fund wallet
      </Link>
    </div>
  );
}
