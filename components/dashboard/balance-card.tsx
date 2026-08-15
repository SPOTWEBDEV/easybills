"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Plus, ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { NotchCard } from "@/components/shared/notch-card";
import { formatNaira } from "@/lib/utils";
import { Wallet } from "@/lib/types";

export function BalanceCard({ wallet }: { wallet: Wallet }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <NotchCard perforateAt="72%" className="relative bg-brand-mesh text-white shadow-glow">
      <div className="relative z-10 px-6 pt-6 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-brand-200" />
            Wallet balance
          </div>
          <button
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide balance" : "Reveal balance"}
            className="rounded-full bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative mt-3 h-11 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {revealed ? (
              <motion.div
                key="revealed"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="font-display text-4xl font-bold tabular-nums"
              >
                {formatNaira(wallet.balance)}
              </motion.div>
            ) : (
              <motion.button
                key="hidden"
                onClick={() => setRevealed(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="scratch-shimmer relative flex h-11 w-52 items-center overflow-hidden rounded-xl bg-white/15 animate-shimmer"
              >
                <span className="w-full text-center font-display text-sm font-semibold tracking-[0.3em] text-white/70">
                  TAP TO SCRATCH & REVEAL
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-1 text-xs text-white/60">
          Cashback earned: <span className="font-semibold text-brand-200">{formatNaira(wallet.cashback)}</span>
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-2 divide-x divide-white/10 px-2 py-3">
        <Link
          href="/wallet/fund"
          className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
            <Plus className="h-4 w-4" />
          </span>
          Fund wallet
        </Link>
        <Link
          href="/wallet/withdraw"
          className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
            <ArrowUpRight className="h-4 w-4" />
          </span>
          Withdraw
        </Link>
      </div>
    </NotchCard>
  );
}
