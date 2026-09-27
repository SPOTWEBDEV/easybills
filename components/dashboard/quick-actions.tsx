"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Smartphone, Wifi, Zap, Tv, GraduationCap, MoreHorizontal } from "lucide-react";

const actions = [
  { label: "Airtime", href: "/services/airtime", icon: Smartphone, bg: "bg-brand-50 dark:bg-brand-500/10", fg: "text-brand-600 dark:text-brand-300" },
  { label: "Data", href: "/services/data", icon: Wifi, bg: "bg-emerald-50 dark:bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-500" },
  { label: "Electricity", href: "/services/electricity", icon: Zap, bg: "bg-coral-50 dark:bg-coral-500/10", fg: "text-coral-600 dark:text-coral-500" },
  { label: "Cable TV", href: "/services/electricity", icon: Tv, bg: "bg-brand-100 dark:bg-brand-500/15", fg: "text-brand-700 dark:text-brand-200" },
  { label: "Exam Pins", href: "/services/electricity", icon: GraduationCap, bg: "bg-emerald-50 dark:bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-500" },
  { label: "More", href: "/services", icon: MoreHorizontal, bg: "bg-ink-100 dark:bg-ink-800", fg: "text-ink-600 dark:text-paper-200/70" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
        >
          <Link
            href={action.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 py-4 shadow-soft transition-transform active:scale-95"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.bg} ${action.fg}`}>
              <action.icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium">{action.label}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
