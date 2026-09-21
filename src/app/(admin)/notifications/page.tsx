"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Megaphone, Send, Mail, Bell } from "lucide-react";
import { getAdminBroadcasts, sendAdminBroadcast, ApiRequestError } from "@/lib/api";
import type { AdminBroadcast } from "@/lib/types";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatDate, cx } from "@/lib/utils";

const STATUS_TONE: Record<string, string> = {
  sent: "bg-good/15 text-good",
  pending: "bg-warn/15 text-warn",
  failed: "bg-bad/15 text-bad",
};

export default function NotificationsPage() {
  const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<"push" | "email">("push");
  const [audience, setAudience] = useState<"all" | "new_users">("all");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{ sentTo: number } | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminBroadcasts();
      setBroadcasts(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load notification history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    setSendError(null);
    setSendResult(null);

    if (!title.trim() || !body.trim()) {
      setSendError("Add a title and a message before sending.");
      return;
    }

    setSending(true);
    try {
      const res = await sendAdminBroadcast({ title: title.trim(), body: body.trim(), channel, audience });
      setSendResult({ sentTo: res.sentTo });
      setTitle("");
      setBody("");
      await load();
    } catch (err) {
      setSendError(err instanceof ApiRequestError ? err.message : "Couldn't send this announcement.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Notifications</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Send announcements to your customers — this only reaches the mobile app, not other admins.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <form
          onSubmit={handleSend}
          className="rounded-2xl border border-line bg-surface p-6 shadow-card lg:col-span-1"
        >
          <h2 className="mb-4 font-display text-base font-semibold text-ink">New announcement</h2>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New: JAMB pin now available"
              className="w-full rounded-lg border border-line bg-base px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Message</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="What do you want customers to know?"
              className="w-full resize-none rounded-lg border border-line bg-base px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
            />
          </label>

          <div className="mb-4">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Channel</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChannel("push")}
                className={cx(
                  "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  channel === "push"
                    ? "border-brand-500 bg-brand-500/10 text-brand-600"
                    : "border-line text-ink-muted hover:text-ink"
                )}
              >
                <Bell className="h-4 w-4" />
                Push
              </button>
              <button
                type="button"
                onClick={() => setChannel("email")}
                className={cx(
                  "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  channel === "email"
                    ? "border-brand-500 bg-brand-500/10 text-brand-600"
                    : "border-line text-ink-muted hover:text-ink"
                )}
              >
                <Mail className="h-4 w-4" />
                Email
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-ink-faint">
              {channel === "push"
                ? "Sent as an OS-level push to every device the customer has registered, plus an inbox entry in the app."
                : "Sent to each customer's account email, plus an inbox entry in the app."}
            </p>
          </div>

          <label className="mb-5 block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">Audience</span>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as "all" | "new_users")}
              className="w-full rounded-lg border border-line bg-base px-3.5 py-2.5 text-sm text-ink focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All active users</option>
              <option value="new_users">New users (joined in the last 30 days)</option>
            </select>
          </label>

          {sendError && (
            <div className="mb-4 rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-xs text-bad">
              {sendError}
            </div>
          )}
          {sendResult && !sendError && (
            <div className="mb-4 rounded-lg border border-good/30 bg-good/10 px-3 py-2 text-xs text-good">
              Sent to {sendResult.sentTo.toLocaleString()} user{sendResult.sentTo === 1 ? "" : "s"}.
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-brand-600 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending…" : "Send announcement"}
          </button>
        </form>

        <div className="rounded-2xl border border-line bg-surface shadow-card lg:col-span-2">
          <div className="border-b border-line p-4">
            <h2 className="font-display text-base font-semibold text-ink">Broadcast history</h2>
          </div>

          {loading && <LoadingState label="Loading broadcast history…" />}
          {!loading && error && <ErrorState message={error} onRetry={load} />}
          {!loading && !error && broadcasts.length === 0 && (
            <div className="p-4">
              <EmptyState
                icon={Megaphone}
                title="No announcements sent yet"
                description="Once you send your first broadcast, it'll show up here with delivery status."
              />
            </div>
          )}

          {!loading && !error && broadcasts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Channel</th>
                    <th className="px-4 py-3 font-medium">Audience</th>
                    <th className="px-4 py-3 font-medium">Sent to</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {broadcasts.map((b) => (
                    <tr key={b.id} className="border-b border-line-soft last:border-0 hover:bg-surface-hover">
                      <td className="px-4 py-3">
                        <span className="block font-medium text-ink">{b.title}</span>
                        <span className="block max-w-xs truncate text-xs text-ink-faint">{b.body}</span>
                      </td>
                      <td className="px-4 py-3 capitalize text-ink-muted">{b.channel}</td>
                      <td className="px-4 py-3 text-ink-muted">
                        {b.audience === "all" ? "All users" : "New users"}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{b.sentTo.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                            STATUS_TONE[b.status] || "bg-surface-hover text-ink-muted"
                          )}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{formatDate(b.sentAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
