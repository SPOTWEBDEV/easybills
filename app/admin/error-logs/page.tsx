"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertOctagon, Bug, CheckCircle2, Copy, FlaskConical, ListChecks, RefreshCw, Search, Trash2, X, XCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { useAdminRole } from "@/hooks/use-admin-role";
import { adminErrorLogsApi, type ErrorLevel, type ErrorLogDetail, type ErrorLogRow } from "@/lib/api/admin/error-logs";
import { fmtDateTime } from "@/lib/admin-format";
import { cn } from "@/lib/utils";

const LEVEL_STYLE: Record<ErrorLevel, string> = {
  fatal: "bg-red-600 text-white",
  error: "bg-coral-50 text-coral-600 dark:bg-coral-500/10 dark:text-coral-500",
  caught: "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-paper-200/70",
};
function LevelBadge({ level }: { level: ErrorLevel }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold uppercase", LEVEL_STYLE[level])}>{level}</span>;
}

const pathOf = (url: string | null) => {
  if (!url) return "";
  try { const u = new URL(url); return u.pathname + u.search; } catch { return url; }
};
function pretty(s?: string | null): string | null {
  if (!s) return null;
  try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return s; }
}

// All fields below come from text typed by outside users (messages, URLs, bodies). React renders them as text, never as HTML.
function buildReport(d: ErrorLogDetail): string {
  return [
    `Time: ${d.time}`, `Request ID: ${d.requestId}`, `Level: ${d.level}`, `Message: ${d.message}`,
    `Location: ${d.file ?? "?"}${d.line ? `:${d.line}` : ""}`, `Likely cause: ${d.cause ?? "—"}`,
    `Request: ${d.method ?? ""} ${d.url ?? ""} (${d.statusCode ?? "—"})`, `Occurrences: ${d.occurrences}`,
    "", "Code:", d.codeSnippet ?? "—", "", "Trace:", d.trace ?? "—",
  ].join("\n");
}

export default function AdminErrorLogsPage() {
  const queryClient = useQueryClient();
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();

  const [level, setLevel] = useState<"all" | ErrorLevel>("all");
  const [resolved, setResolved] = useState<"all" | "0" | "1">("0");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [auto, setAuto] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState<"test" | "clear" | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setQ(search.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-error-logs", level, resolved, q, from, to, page],
    queryFn: () => adminErrorLogsApi.list({
      level: level === "all" ? undefined : level, resolved: resolved === "all" ? undefined : resolved,
      q: q || undefined, from: from || undefined, to: to || undefined, page, perPage: 25,
    }),
    enabled: isSuperAdmin,
    refetchInterval: auto && openId === null ? 10_000 : false, // auto-refresh every 10 s, but never while a detail drawer is open
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-error-logs"] });
    queryClient.invalidateQueries({ queryKey: ["admin-error-badge"] });
  };

  const sendTest = async () => {
    setBusy("test");
    try { const r = await adminErrorLogsApi.test(); toast.success(`Test error logged (#${r.id})`); refreshAll(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not log a test error."); }
    finally { setBusy(null); }
  };
  const clearResolved = async () => {
    setBusy("clear");
    try {
      const r = await adminErrorLogsApi.clear({ onlyResolved: true, olderThanDays: 0 });
      toast.success(`${r.deleted} resolved ${r.deleted === 1 ? "entry" : "entries"} deleted`);
      setConfirmClear(false); refreshAll();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not clear the logbook."); }
    finally { setBusy(null); }
  };

  if (!roleLoading && !isSuperAdmin) {
    return (
      <AdminShell>
        <AdminPageHeading title="Error Logbook" subtitle="Server errors with their likely cause" />
        <Card className="p-8 text-center text-sm text-ink-500 dark:text-paper-200/40">
          Only super admins can view the error logbook, because logs can reveal file paths, SQL and provider replies.
        </Card>
      </AdminShell>
    );
  }

  const summary = data?.summary;
  const rows = data?.data ?? [];

  return (
    <AdminShell>
      <AdminPageHeading
        title="Error Logbook"
        subtitle="Every server error with its time, request and likely cause"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold dark:border-ink-700">
              Auto-refresh <Switch checked={auto} onCheckedChange={setAuto} />
            </label>
            <Button variant="outline" size="sm" onClick={() => refetch()} loading={isFetching && !isLoading}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
            <Button variant="outline" size="sm" onClick={sendTest} loading={busy === "test"}><FlaskConical className="h-3.5 w-3.5" /> Send test error</Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmClear(true)}><Trash2 className="h-3.5 w-3.5" /> Clear resolved</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Fatal (24h)" value={summary ? String(summary.last24h.fatal) : "—"} icon={AlertOctagon} />
        <AdminStatCard label="Errors (24h)" value={summary ? String(summary.last24h.error) : "—"} icon={XCircle} />
        <AdminStatCard label="Caught (24h)" value={summary ? String(summary.last24h.caught) : "—"} icon={Bug} />
        <AdminStatCard label="Unresolved total" value={summary ? String(summary.unresolvedTotal) : "—"} icon={ListChecks} />
      </div>

      {summary && summary.topRepeating.length > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Repeating most</CardTitle></CardHeader>
          <CardContent className="space-y-1 pt-3">
            {summary.topRepeating.map((r) => (
              <button key={r.id} onClick={() => setOpenId(r.id)} className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2 text-left text-sm hover:bg-ink-50 dark:hover:bg-ink-800/40">
                <span className="truncate">{r.message}</span>
                <span className="shrink-0 rounded-full bg-coral-50 px-2 py-0.5 text-xs font-bold text-coral-600 dark:bg-coral-500/10 dark:text-coral-500">×{r.count}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={level} onValueChange={(v) => { setLevel(v as typeof level); setPage(1); }}>
          <TabsList>
            <TabsTrigger value="all">All levels</TabsTrigger>
            <TabsTrigger value="fatal">Fatal</TabsTrigger>
            <TabsTrigger value="error">Error</TabsTrigger>
            <TabsTrigger value="caught">Caught</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={resolved} onValueChange={(v) => { setResolved(v as typeof resolved); setPage(1); }}>
          <TabsList>
            <TabsTrigger value="0">Unresolved</TabsTrigger>
            <TabsTrigger value="1">Resolved</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input placeholder="Search message, URL, file or request id…" leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
        <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} aria-label="From date" className="h-12 rounded-2xl border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-900" />
        <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} aria-label="To date" className="h-12 rounded-2xl border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-900" />
      </div>

      <Card className="mt-4 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left dark:border-ink-700">
                {["Time", "Level", "Message", "Request", "Cause", "×", "Resolved"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7} className="px-4 py-2"><Skeleton className="h-10 w-full" /></td></tr>)
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-sm text-ink-500 dark:text-paper-200/40">No errors match these filters. 🎉</td></tr>
              ) : rows.map((r: ErrorLogRow) => (
                <tr key={r.id} onClick={() => setOpenId(r.id)} className="cursor-pointer border-b border-ink-50 last:border-0 hover:bg-ink-50/60 dark:border-ink-800/60 dark:hover:bg-ink-800/40">
                  <td className="whitespace-nowrap px-4 py-3 text-xs">{fmtDateTime(r.time)}</td>
                  <td className="px-4 py-3"><LevelBadge level={r.level} /></td>
                  <td className="max-w-[320px] px-4 py-3">
                    <p className="truncate font-semibold" title={r.message}>{r.message}</p>
                    {r.file && <p className="truncate font-mono text-[11px] text-ink-500 dark:text-paper-200/40">{r.file}{r.line ? `:${r.line}` : ""}</p>}
                  </td>
                  <td className="max-w-[240px] px-4 py-3">
                    <p className="truncate text-xs"><b>{r.method}</b> {pathOf(r.url)} {r.statusCode ? `· ${r.statusCode}` : ""}</p>
                    <p className="font-mono text-[11px] text-ink-500 dark:text-paper-200/40">{r.requestId}</p>
                  </td>
                  <td className="max-w-[260px] px-4 py-3 text-xs text-ink-600 dark:text-paper-200/60"><p className="line-clamp-2">{r.cause ?? "—"}</p></td>
                  <td className="px-4 py-3 font-semibold">{r.occurrences > 1 ? `×${r.occurrences}` : "1"}</td>
                  <td className="px-4 py-3">{r.resolved ? <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-label="Resolved" /> : <span className="text-xs text-ink-400">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && (
          <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 dark:border-ink-700">
            <p className="text-xs text-ink-500 dark:text-paper-200/40">{data.meta.total} total</p>
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      {openId !== null && <Drawer id={openId} onClose={() => setOpenId(null)} onOpen={setOpenId} onChanged={refreshAll} />}

      <ConfirmDialog open={confirmClear} onOpenChange={setConfirmClear} danger loading={busy === "clear"} confirmLabel="Delete resolved"
        title="Clear resolved errors?" description="This permanently deletes every resolved entry. Unresolved errors are kept. The server also auto-deletes entries older than 30 days."
        onConfirm={clearResolved} />
    </AdminShell>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40">{title}</p>
      {children}
    </div>
  );
}
const preCls = "max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-ink-50 p-3 font-mono text-xs dark:bg-ink-950";

function Drawer({ id, onClose, onOpen, onChanged }: { id: number; onClose: () => void; onOpen: (id: number) => void; onChanged: () => void }) {
  const queryClient = useQueryClient();
  const { data: d, isLoading, isError } = useQuery({ queryKey: ["admin-error-log", id], queryFn: () => adminErrorLogsApi.get(id) });
  const [saving, setSaving] = useState(false);

  const resolve = async (resolved: boolean, allSimilar: boolean) => {
    setSaving(true);
    try {
      const r = await adminErrorLogsApi.resolve(id, { resolved, allSimilar });
      toast.success(`${r.updated} ${r.updated === 1 ? "entry" : "entries"} updated`);
      queryClient.invalidateQueries({ queryKey: ["admin-error-log", id] });
      onChanged();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Could not update this entry."); }
    finally { setSaving(false); }
  };
  const copy = async () => {
    if (!d) return;
    try { await navigator.clipboard.writeText(buildReport(d)); toast.success("Report copied"); } catch { toast.error("Couldn't copy"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Error details">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="relative h-full w-full max-w-2xl space-y-5 overflow-y-auto bg-white p-6 shadow-soft-dark dark:bg-ink-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">{d && <LevelBadge level={d.level} />}<h2 className="font-display text-lg font-bold">Error #{id}</h2></div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-ink-100 dark:hover:bg-ink-800"><X className="h-4 w-4" /></button>
        </div>

        {isLoading ? <Skeleton className="h-64 w-full" /> : isError || !d ? <p className="text-sm text-ink-500">Couldn&apos;t load this entry.</p> : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={copy}><Copy className="h-3.5 w-3.5" /> Copy report</Button>
              <Button size="sm" variant="outline" loading={saving} onClick={() => resolve(!d.resolved, false)}>{d.resolved ? "Mark unresolved" : "Mark resolved"}</Button>
              {d.occurrences > 1 && !d.resolved && <Button size="sm" loading={saving} onClick={() => resolve(true, true)}>Resolve all {d.occurrences} similar</Button>}
            </div>

            <Block title="Message"><p className="break-words text-sm font-semibold">{d.message}</p></Block>
            {d.cause && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Likely cause</p>
                <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-200">{d.cause}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              {([["Time", fmtDateTime(d.time)], ["Request ID", d.requestId], ["Request", `${d.method ?? ""} ${d.url ?? ""}`], ["Status", d.statusCode ?? "—"],
                ["Exception", d.exceptionClass ?? "—"], ["Location", `${d.file ?? "?"}${d.line ? `:${d.line}` : ""}`], ["User ID", d.userId ?? "—"], ["IP", d.ip ?? "—"],
                ["Occurrences", d.occurrences]] as [string, React.ReactNode][]).map(([k, v]) => (
                <div key={k} className="min-w-0"><p className="text-ink-500 dark:text-paper-200/40">{k}</p><p className="break-all font-medium">{v}</p></div>
              ))}
              <div className="col-span-2 min-w-0"><p className="text-ink-500 dark:text-paper-200/40">User agent</p><p className="break-all font-medium">{d.userAgent ?? "—"}</p></div>
            </div>

            {d.codeSnippet && <Block title="Code"><pre className={preCls}>{d.codeSnippet}</pre></Block>}
            {d.trace && <Block title="Trace"><pre className={preCls}>{d.trace}</pre></Block>}
            {pretty(d.requestBody) && <Block title="Request body (redacted)"><pre className={preCls}>{pretty(d.requestBody)}</pre></Block>}
            {pretty(d.context) && <Block title="Context (redacted)"><pre className={preCls}>{pretty(d.context)}</pre></Block>}

            {d.relatedInRequest.length > 0 && (
              <Block title="Other rows from the same request">
                <div className="space-y-1">
                  {d.relatedInRequest.map((r) => (
                    <button key={r.id} onClick={() => onOpen(r.id)} className="flex w-full items-center gap-3 rounded-xl border border-ink-100 px-3 py-2 text-left text-xs hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-800/40">
                      <LevelBadge level={r.level} /><span className="truncate">{r.message}</span>
                    </button>
                  ))}
                </div>
              </Block>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
