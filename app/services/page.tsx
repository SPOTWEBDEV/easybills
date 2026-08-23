"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  Smartphone, Wifi, Zap, Tv, GraduationCap, Wallet2, MoreHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";

const primaryServices = [
  {
    label: "Airtime",
    subtitle: "Top up any network instantly",
    href: "/services/airtime",
    icon: Smartphone,
    bg: "bg-brand-50 dark:bg-brand-500/10",
    fg: "text-brand-600 dark:text-brand-300",
    live: true,
  },
  {
    label: "Data",
    subtitle: "Buy data bundles for less",
    href: "/services/data",
    icon: Wifi,
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    fg: "text-emerald-600 dark:text-emerald-500",
    live: true,
  },
  {
    label: "Electricity",
    subtitle: "Pay prepaid & postpaid bills",
    href: "/services/electricity",
    icon: Zap,
    bg: "bg-coral-50 dark:bg-coral-500/10",
    fg: "text-coral-600 dark:text-coral-500",
    live: true,
  },
  {
    label: "Cable TV",
    subtitle: "DStv, GOtv & Startimes",
    href: "#",
    icon: Tv,
    bg: "bg-brand-50 dark:bg-brand-500/10",
    fg: "text-brand-600 dark:text-brand-300",
    live: false,
  },
  {
    label: "Exam Pins",
    subtitle: "WAEC, JAMB & NECO pins",
    href: "#",
    icon: GraduationCap,
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    fg: "text-emerald-600 dark:text-emerald-500",
    live: false,
  },
  {
    label: "Fund Wallet",
    subtitle: "Top up your EasyBills wallet",
    href: "/wallet/fund",
    icon: Wallet2,
    bg: "bg-coral-50 dark:bg-coral-500/10",
    fg: "text-coral-600 dark:text-coral-500",
    live: true,
  },
];

// The rest of ePINs' catalog — not wired to real purchase flows yet.
// Shown so nothing from the provider's product list is hidden from you,
// but each is honestly marked "Coming soon" rather than pretending to work.
const moreServices = [
  { label: "Recharge Card PIN", icon: Smartphone },
  { label: "Data Card", icon: Wifi },
  { label: "Bulk Airtime", icon: Smartphone },
  { label: "Betting Wallet", icon: Wallet2 },
  { label: "Motor Insurance", icon: MoreHorizontal },
];

export default function ServicesPage() {
  return (
    <AppShell>
      <PageHeader title="Services" subtitle="Everything you need, in one tap" />

      <div className="grid grid-cols-2 gap-3 px-5 pt-4">
        {primaryServices.map((service) =>
          service.live ? (
            <Link
              key={service.label}
              href={service.href}
              className="flex flex-col gap-3 rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 p-4 shadow-soft transition-transform active:scale-95"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${service.bg} ${service.fg}`}>
                <service.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{service.label}</p>
                <p className="mt-0.5 text-xs text-ink-500 dark:text-paper-200/40">{service.subtitle}</p>
              </div>
            </Link>
          ) : (
            <button
              key={service.label}
              onClick={() => toast("Coming soon on EasyBills")}
              className="relative flex flex-col gap-3 rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 p-4 text-left opacity-60 shadow-soft"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${service.bg} ${service.fg}`}>
                <service.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{service.label}</p>
                <p className="mt-0.5 text-xs text-ink-500 dark:text-paper-200/40">{service.subtitle}</p>
              </div>
              <span className="absolute right-3 top-3 rounded-full bg-ink-900 dark:bg-paper-50 px-1.5 py-0.5 text-[9px] font-bold text-white dark:text-ink-900">
                SOON
              </span>
            </button>
          )
        )}

        <button
          onClick={() => toast("More services would open here")}
          className="col-span-2 flex items-center gap-3 rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 p-4 shadow-soft"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-paper-200/50">
            <MoreHorizontal className="h-5 w-5" />
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold">More</p>
            <p className="mt-0.5 text-xs text-ink-500 dark:text-paper-200/40">All other services</p>
          </div>
        </button>
      </div>

      <div className="px-5 pt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40">
          Also from our provider — coming soon
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {moreServices.map((s) => (
            <button
              key={s.label}
              onClick={() => toast("Coming soon on EasyBills")}
              className="flex items-center gap-2.5 rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 px-3.5 py-3 text-left opacity-60"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-paper-200/50">
                <s.icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}