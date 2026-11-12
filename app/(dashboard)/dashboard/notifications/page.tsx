"use client";
import { useEffect, useState } from "react";
import { Bell, CloudOff, Gift, Megaphone, Receipt, type LucideIcon } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { formatDate } from "@/components/dashboard/transaction-row";
import { useApiData } from "@/hooks/use-api-data";
import { notificationsApi, type AppNotification, type NotificationType } from "@/lib/api/dashboard";
import { cn } from "@/lib/utils";

const ICONS: Record<NotificationType, LucideIcon> = { transaction: Receipt, referral: Gift, announcement: Megaphone, general: Bell };

export default function NotificationsPage() {
  const list = useApiData(() => notificationsApi.list({ perPage: 30 }));
  const [items, setItems] = useState<AppNotification[]>([]);
  const [marking, setMarking] = useState(false);
  useEffect(() => { if (list.data) setItems(list.data); }, [list.data]);
  const unread = items.filter((n) => !n.read).length;

  const setRead = (id: string, read: boolean) => setItems((p) => p.map((n) => (n.id === id ? { ...n, read } : n)));
  const onTap = async (n: AppNotification) => {
    if (n.read) return;
    setRead(n.id, true); // optimistic, reverted on failure
    try { await notificationsApi.markRead(n.id); } catch { setRead(n.id, false); }
  };
  const onMarkAll = async () => {
    setMarking(true);
    setItems((p) => p.map((n) => ({ ...n, read: true })));
    try { await notificationsApi.markAllRead(); } catch { list.refresh(); } finally { setMarking(false); }
  };

  return (
    <div>
      <SubPageHeader title="Notifications" back="/dashboard" />
      {unread > 0 && (
        <button onClick={onMarkAll} disabled={marking} className="mb-4 text-sm font-bold text-brand-500">
          {marking ? "Marking…" : "Mark all read"}
        </button>
      )}
      {list.loading ? <p className="py-10 text-center text-sm text-[rgb(var(--fg-muted))]">Loading…</p>
        : list.error ? <div className="flex flex-col items-center gap-2 py-12 text-[rgb(var(--fg-muted))]"><CloudOff className="h-7 w-7" /><p className="text-sm">{list.error.message}</p></div>
        : items.length === 0 ? <div className="flex flex-col items-center gap-2 py-12 text-[rgb(var(--fg-muted))]"><Bell className="h-7 w-7" /><p className="text-sm">No notifications yet</p></div>
        : <ul className="space-y-3">{items.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            return (
              <li key={n.id}>
                <button onClick={() => onTap(n)} className={cn("flex w-full items-start gap-4 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 text-left", !n.read && "border-brand-500")}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900/5 text-[rgb(var(--fg-muted))] dark:bg-white/5"><Icon className="h-[18px] w-[18px]" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{n.title}</span>
                    <span className="mt-0.5 block text-sm text-[rgb(var(--fg-muted))]">{n.body}</span>
                    <span className="mt-2 block text-xs text-[rgb(var(--fg-muted))]">{formatDate(n.createdAt)}</span>
                  </span>
                  {!n.read && <span aria-label="Unread" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                </button>
              </li>
            );
          })}</ul>}
    </div>
  );
}
