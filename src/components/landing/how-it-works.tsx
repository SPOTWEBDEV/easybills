"use client";

import { motion } from "framer-motion";
import { UserPlus, WalletMinimal, ZapIcon } from "lucide-react";
import { Section } from "@/components/shared/section";

const steps = [
  {
    icon: UserPlus,
    title: "Create your account",
    body: "Sign up in under a minute with your phone number and verify with a one-time code.",
  },
  {
    icon: WalletMinimal,
    title: "Fund your wallet",
    body: "Top up instantly via bank transfer, card, or your dedicated virtual account.",
  },
  {
    icon: ZapIcon,
    title: "Pay any bill, instantly",
    body: "Pick a service, confirm the amount, and get your receipt — usually in under 5 seconds.",
  },
];

export function HowItWorks() {
  return (
    <Section className="py-16 md:py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Three steps. That&apos;s it.
        </h2>
      </div>

      <div className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
        <div className="absolute left-0 right-0 top-8 hidden h-px bg-ink-200 dark:bg-ink-700 md:block" />
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="relative flex flex-col items-center text-center md:items-start md:text-left"
          >
            <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-mesh text-white shadow-glow">
              <step.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold">
              {i + 1}. {step.title}
            </h3>
            <p className="mt-2 text-sm text-ink-600 dark:text-paper-200/60">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
