"use client";

import { motion } from "framer-motion";
import {
  Smartphone,
  Wifi,
  Zap,
  Droplets,
  Tv,
  GraduationCap,
  BookOpen,
  FileBadge,
  CreditCard,
  Dices,
  School,
  Gift,
} from "lucide-react";
import { Section } from "@/components/shared/section";

const services = [
  { label: "Airtime", icon: Smartphone },
  { label: "Data Bundles", icon: Wifi },
  { label: "Electricity", icon: Zap },
  { label: "Water Bills", icon: Droplets },
  { label: "Cable TV", icon: Tv },
  { label: "WAEC Cards", icon: GraduationCap },
  { label: "NECO Cards", icon: BookOpen },
  { label: "JAMB ePIN", icon: FileBadge },
  { label: "NABTEB PIN", icon: School },
  { label: "Recharge Cards", icon: CreditCard },
  { label: "Betting Wallet", icon: Dices },
  { label: "Gift Cards", icon: Gift },
];

export function ServicesGrid() {
  return (
    <Section id="services" className="py-16 md:py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Everything you pay for, in one place
        </h2>
        <p className="mt-3 text-ink-600 dark:text-paper-200/60">
          Twelve bill categories today, and counting — new providers ship without a single app
          update.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-3 md:grid-cols-4 md:gap-4">
        {services.map((service, i) => (
          <motion.div
            key={service.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: (i % 4) * 0.05, duration: 0.35 }}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 px-4 py-6 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-300 dark:hover:border-brand-500/50"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300 transition-colors group-hover:bg-brand-600 group-hover:text-white">
              <service.icon className="h-5 w-5" />
            </span>
            <span className="text-center text-xs font-semibold md:text-sm">{service.label}</span>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
