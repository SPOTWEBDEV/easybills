"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Gauge, Smartphone, PiggyBank, RefreshCcw, HeadphonesIcon } from "lucide-react";
import { Section } from "@/components/shared/section";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Gauge,
    title: "Instant delivery",
    body: "Most airtime, data and bill payments land in under 5 seconds — no waiting, no manual approval.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-level security",
    body: "PIN and 2FA protection on every transaction, with encrypted wallets and verified providers.",
  },
  {
    icon: Smartphone,
    title: "Installs like an app",
    body: "Add EasyBills to your home screen — works offline, loads instantly, feels native.",
  },
  {
    icon: PiggyBank,
    title: "Best-in-market rates",
    body: "Transparent pricing with cashback on every purchase. No hidden charges, ever.",
  },
  {
    icon: RefreshCcw,
    title: "Auto retry on failure",
    body: "If a provider hiccups, we retry automatically and refund instantly if it still fails.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 human support",
    body: "Live chat and support tickets, answered by real people — not just a bot.",
  },
];

export function Features() {
  return (
    <Section className="py-16 md:py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Built for how Nigeria actually pays
        </h2>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: (i % 3) * 0.08, duration: 0.35 }}
          >
            <Card className="h-full p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-ink-600 dark:text-paper-200/60">{feature.body}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
