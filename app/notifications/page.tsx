"use client";

import { CheckCircle2, Gift, Megaphone, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";

const notifications = [
  {
    icon: CheckCircle2,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
    title: "Payment successful",
    body: "Your Ikeja Electric payment of ₦10,000 was successful.",
    time: "2h ago",
  },
  {
    icon: Gift,
    color: "text-brand-600 bg-brand-50 dark:bg-brand-500/10",
    title: "Cashback earned",
    body: "You earned ₦15 cashback on your last data purchase.",
    time: "5h ago",
  },
  {
    icon: Megaphone,
    color: "text-brand-600 bg-brand-50 dark:bg-brand-500/10",
    title: "New: JAMB ePIN now live",
    body: "Buy JAMB ePINs directly from EasyBills — no more queues.",
    time: "1d ago",
  },
  {
    icon: ShieldAlert,
    color: "text-coral-600 bg-coral-50 dark:bg-coral-500/10",
    title: "New device login",
    body: "Your account was accessed from a new device in Lagos, NG.",
    time: "2d ago",
  },
];

export default function NotificationsPage() {
  return (
    <AppShell>
      <PageHeader title="Notifications" subtitle="Stay up to date" />

      <div className="space-y-2 px-5 pt-2">
        {notifications.map((n, i) => (
          <div
            key={i}
            className="flex items-start gap-3.5 rounded-2xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 p-4 shadow-soft"
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${n.color}`}>
              <n.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{n.title}</p>
                <span className="shrink-0 text-[10px] text-ink-400 dark:text-paper-200/30">{n.time}</span>
              </div>
              <p className="mt-0.5 text-xs text-ink-600 dark:text-paper-200/50">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
