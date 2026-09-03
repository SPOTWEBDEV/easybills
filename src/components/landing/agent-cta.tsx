"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";

export function AgentCta() {
  return (
    <Section id="agents" className="py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl bg-brand-mesh px-6 py-12 text-white md:px-14 md:py-16"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-brand-300/25 blur-3xl" />
        <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold">
              <TrendingUp className="h-3.5 w-3.5 text-brand-200" /> Become an agent
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl">
              Set your own margins. Keep the profit.
            </h2>
            <p className="mt-4 max-w-md text-sm text-white/70 md:text-base">
              Agents on EasyBills buy at wholesale and resell at a price they control. Every
              markup goes straight to your wallet, in real time.
            </p>
            <Button asChild size="lg" variant="invert" className="mt-6">
              <Link href="/become-an-agent">
                Apply to become an agent <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
              Example: Airtime resale
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Wholesale cost</span>
                <span className="font-mono font-semibold">{formatNaira(980)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Your margin</span>
                <span className="font-mono font-semibold text-brand-200">+ {formatNaira(30)}</span>
              </div>
              <div className="h-px bg-white/15" />
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold">Customer pays</span>
                <span className="font-mono font-bold">{formatNaira(1010)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
