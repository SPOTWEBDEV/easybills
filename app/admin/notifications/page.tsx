"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { StatusPill } from "@/components/admin/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminBroadcastsApi, type BroadcastAudience, type BroadcastChannel, type BroadcastRow } from "@/lib/api/admin/broadcasts";
import { fmtDateTime } from "@/lib/admin-format";
import { cn } from "@/lib/utils";

const AUDIENCES: { id: BroadcastAudience; label: string; hint: string }[] = [
  { id: "all", label: "Everyone", hint: "All active users" },
  { id: "new_users", label: "New users", hint: "Active users who signed up in the last 30 days" },
];
const CHANNELS: { id: BroadcastChannel; label: string }[] = [{ id: "push", label: "Push" }, { id: "email", label: "Email" }];

const columns: Column<BroadcastRow>[] = [
  {
    key: "title", header: "Notification",
    render: (n) => (<div className="max-w-[320px]"><p className="truncate font-semibold">{n.title}</p>{n.body && <p className="truncate text-xs text-ink-500 dark:text-paper-200/40">{n.body}</p>}</div>),
  },
  { key: "channel", header: "Channel", render: (n) => <Badge variant="neutral" className="uppercase">{n.channel}</Badge> },
  { key: "audience", header: "Audience", render: (n) => (n.audience === "new_users" ? "New users" : n.audience === "all" ? "Everyone" : n.audience) },
  { key: "sentTo", header: "Matched users", render: (n) => n.sentTo.toLocaleString() },
  { key: "status", header: "Status", render: (n) => <StatusPill status={n.status} /> },
  { key: "sentAt", header: "Sent", render: (n) => fmtDateTime(n.sentAt) },
];

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-broadcasts"], queryFn: adminBroadcastsApi.list });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<BroadcastChannel>("push");
  const [audience, setAudience] = useState<BroadcastAudience>("all");
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const audienceLabel = AUDIENCES.find((a) => a.id === audience)!;

  const onSend = async () => {
    setSending(true);
    try {
      const r = await adminBroadcastsApi.send({ title: title.trim(), body: body.trim() || undefined, channel, audience });
      toast.success(`Sent to ${r.sentTo.toLocaleString()} matched ${r.sentTo === 1 ? "user" : "users"}`);
      setConfirm(false); setTitle(""); setBody("");
      queryClient.invalidateQueries({ queryKey: ["admin-broadcasts"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not send this notification."); }
    finally { setSending(false); }
  };

  return (
    <AdminShell>
      <AdminPageHeading title="Notifications" subtitle="Broadcast a message to your users" />

      <Card>
        <CardHeader>
          <CardTitle>New broadcast</CardTitle>
          <CardDescription>Every matched user also gets an in-app inbox message. Push or email is how they hear about it first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} maxLength={120} placeholder="e.g. Gift cards are now live" onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Message (optional)</Label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={500}
              className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-ink-700 dark:bg-ink-900" />
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="space-y-1.5">
              <Label>Channel</Label>
              <div className="flex gap-2">
                {CHANNELS.map((c) => (
                  <button key={c.id} type="button" onClick={() => setChannel(c.id)}
                    className={cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold", channel === c.id ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 dark:border-ink-700")}>{c.label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <div className="flex gap-2">
                {AUDIENCES.map((a) => (
                  <button key={a.id} type="button" onClick={() => setAudience(a.id)} title={a.hint}
                    className={cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold", audience === a.id ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 dark:border-ink-700")}>{a.label}</button>
                ))}
              </div>
              <p className="text-xs text-ink-500 dark:text-paper-200/40">{audienceLabel.hint}</p>
            </div>
          </div>
          <Button onClick={() => setConfirm(true)} disabled={title.trim().length < 3}><Send className="h-4 w-4" /> Review and send</Button>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-ink-600 dark:text-paper-200/60">History</h2>
        {isLoading ? (
          <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading history...</p>
        ) : (
          <AdminDataTable columns={columns} data={data ?? []} searchKeys={["title"]} searchPlaceholder="Search broadcasts..." />
        )}
      </div>

      <ConfirmDialog open={confirm} onOpenChange={setConfirm} loading={sending} confirmLabel="Send now"
        title={audience === "all" ? "Send to everyone?" : "Send to new users?"}
        description={`"${title.trim()}" will be sent by ${channel} to ${audienceLabel.hint.toLowerCase()}. This can't be undone, and "sent to" counts matched users, not delivery.`}
        onConfirm={onSend} />
    </AdminShell>
  );
}
