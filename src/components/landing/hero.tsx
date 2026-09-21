"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Smartphone, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotchCard } from "@/components/shared/notch-card";
import { Section } from "@/components/shared/section";
import { formatNaira } from "@/lib/utils";

export function Hero() {
  return (
    <Section className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-28">
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-40 h-72 w-72 rounded-full bg-brand-300/15 blur-3xl" />

      <div className="relative grid items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-850 px-3.5 py-1.5 text-xs font-semibold text-ink-700 dark:text-paper-200/80 shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Instant delivery on every bill, every time
          </div>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            Pay every bill, <span className="text-brand-600 dark:text-brand-400">buy every card</span>,
            in one tap.
          </h1>

          <p className="mt-5 max-w-lg text-base text-ink-600 dark:text-paper-200/60 md:text-lg">
            Airtime, data, electricity, cable TV, WAEC &amp; JAMB pins and more — EasyBills gets it
            done in seconds, at the best rates, with receipts you can trust.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#services">Explore services</Link>
            </Button>
          </div>

          <div className="mt-9 flex items-center gap-6 text-xs text-ink-600 dark:text-paper-200/50">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Bank-level security
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-brand-600 dark:text-brand-400" /> Avg. 4s delivery
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto w-full max-w-xs"
        >
          <NotchCard perforateAt="68%" className="bg-brand-mesh text-white shadow-glow">
            <div className="px-6 pt-6 pb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Wallet balance
              </p>
              <p className="mt-2 font-display text-3xl font-bold">{formatNaira(84250.75)}</p>
              <p className="mt-1 text-xs text-white/50">Cashback: {formatNaira(1320.5)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 px-4 pb-5 pt-4">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold">
                <Smartphone className="h-4 w-4 text-brand-200" /> Airtime
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold">
                <Wifi className="h-4 w-4 text-brand-200" /> Data
              </div>
            </div>
          </NotchCard>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-6 -top-6 flex items-center gap-2 rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-850 px-3.5 py-2.5 shadow-soft"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
            </span>
            <div className="text-left">
              <p className="text-[11px] font-semibold">Payment successful</p>
              <p className="text-[10px] text-ink-500 dark:text-paper-200/40">Just now</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}
