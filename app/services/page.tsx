"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  Smartphone, Wifi, Zap, Droplets, Tv, GraduationCap, BookOpen,
  FileBadge, CreditCard, Dices, School, Gift,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";

const services = [
  { label: "Airtime", href: "/services/airtime", icon: Smartphone, live: true },
  { label: "Data Bundles", href: "/services/data", icon: Wifi, live: true },
  { label: "Electricity", href: "/services/electricity", icon: Zap, live: true },
  { label: "Water Bills", href: "#", icon: Droplets, live: false },
  { label: "Cable TV", href: "#", icon: Tv, live: false },
  { label: "WAEC Cards", href: "#", icon: GraduationCap, live: false },
  { label: "NECO Cards", href: "#", icon: BookOpen, live: false },
  { label: "JAMB ePIN", href: "#", icon: FileBadge, live: false },
  { label: "NABTEB PIN", href: "#", icon: School, live: false },
  { label: "Recharge Cards", href: "#", icon: CreditCard, live: false },
  { label: "Betting Wallet", href: "#", icon: Dices, live: false },
  { label: "Gift Cards", href: "#", icon: Gift, live: false },
];

export default function ServicesPage() {
  return (
    <AppShell>
      <PageHeader title="Services" subtitle="Every bill, one place" />

      <div className="grid grid-cols-3 gap-3 px-5 pt-4">
        {services.map((service) =>
          service.live ? (
            <Link
              key={service.label}
              href={service.href}
              className="flex flex-col items-center gap-2.5 rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 py-5 shadow-soft transition-transform active:scale-95"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <service.icon className="h-5 w-5" />
              </span>
              <span className="text-center text-xs font-semibold">{service.label}</span>
            </Link>
          ) : (
            <button
              key={service.label}
              onClick={() => toast("Coming soon on EasyBills")}
              className="relative flex flex-col items-center gap-2.5 rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 py-5 opacity-60 shadow-soft"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-paper-200/50">
                <service.icon className="h-5 w-5" />
              </span>
              <span className="text-center text-xs font-semibold">{service.label}</span>
              <span className="absolute right-2 top-2 rounded-full bg-ink-900 dark:bg-paper-50 px-1.5 py-0.5 text-[9px] font-bold text-white dark:text-ink-900">
                SOON
              </span>
            </button>
          )
        )}
      </div>
    </AppShell>
  );
}
