"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Gift, Megaphone, ShieldAlert, Bell, CheckCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { notificationsApi, NotificationRow } from "@/lib/api/notifications";
import { formatDate } from "@/lib/utils";

const typeIcon: Record<string, { icon: typeof Bell; color: string }> = {
  transaction: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" },
  referral: { icon: Gift, color: "text-brand-600 bg-brand-50 dark:bg-brand-500/10" },
  announcement: { icon: Megaphone, color: "text-brand-600 bg-brand-50 dark:bg-brand-500/10" },
  security: { icon: ShieldAlert, color: "text-coral-600 bg-coral-50 dark:bg-coral-500/10" },
  general: { icon: Bell, color: "text-ink-600 bg-ink-100 dark:bg-ink-800" },
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => notificationsApi.list(page, 20),
  });

  const rows = data?.data ?? [];
  const hasUnread = rows.some((n) => !n.read);

  const handleMarkRead = async (notification: NotificationRow) => {
    if (notification.read) return;
    await notificationsApi.markRead(notification.id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
  };

  return (
    <AppShell>
      <PageHeader title="Notifications" subtitle="Stay up to date" />

      {hasUnread && (
        <div className="flex justify-end px-5 pt-2">
          <Button size="sm" variant="ghost" onClick={handleMarkAllRead}>
            <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
          </Button>
        </div>
      )}

      <div className="space-y-2 px-5 pt-2">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />
          ))
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Bell className="h-8 w-8 text-ink-300 dark:text-paper-200/20" />
            <p className="text-sm text-ink-500 dark:text-paper-200/40">
              No notifications yet — you&apos;ll see updates about your purchases and account here.
            </p>
          </div>
        ) : (
          rows.map((n) => {
            const meta = typeIcon[n.type] ?? typeIcon.general;
            return (
              <button
                key={n.id}
                onClick={() => handleMarkRead(n)}
                className={`flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left shadow-soft transition-colors ${
                  n.read
                    ? "border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850"
                    : "border-brand-200 dark:border-brand-500/40 bg-brand-50/50 dark:bg-brand-500/5"
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.color}`}>
                  <meta.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-600 dark:text-paper-200/50">{n.body}</p>
                  <p className="mt-1 text-[10px] text-ink-400 dark:text-paper-200/30">{formatDate(n.createdAt)}</p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {data && (
        <div className="px-5 pt-4">
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        </div>
      )}
    </AppShell>
  );
}