"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TransactionRow } from "@/components/dashboard/transaction-row";
import { useApiData } from "@/hooks/use-api-data";
import { transactionsApi } from "@/lib/api/dashboard";
import { isCreditCategory } from "@/lib/tx";
import { cn, formatNaira } from "@/lib/utils";

const FILTERS = ["all", "success", "pending", "failed"] as const;

export default function HistoryPage() {
  const { data, loading, error } = useApiData(() => transactionsApi.list());
  const summary = useApiData(() => transactionsApi.summary()); // account-wide stats from the backend, unaffected by the filters below
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const all = data ?? [];

  // Backend summary wins; any field it doesn't return falls back to a calculation from the loaded list.
  const stats = useMemo(() => {
    const ok = all.filter((t) => t.status === "success");
    const b = summary.data;
    return {
      count: b?.count ?? all.length,
      spent: b?.totalSpent ?? ok.filter((t) => !isCreditCategory(t.category)).reduce((s, t) => s + t.amount, 0),
      rate: b?.successRate ?? (all.length ? Math.round((ok.length / all.length) * 1000) / 10 : 0),
    };
  }, [all, summary.data]);

  const shown = all.filter(
    (t) =>
      (filter === "all" || t.status === filter) &&
      `${t.title} ${t.subtitle ?? ""} ${t.reference}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold">Transactions</h1>

      <div className="grid grid-cols-3 gap-3">
        {[
          [String(stats.count), "Transactions"],
          [formatNaira(stats.spent), "Total spent"],
          [`${stats.rate}%`, "Success rate"],
        ].map(([v, l]) => (
          <div key={l} className="rounded-2xl border bg-[rgb(var(--bg-elevated))] px-2 py-4 text-center">
            <p className="font-display text-sm font-bold sm:text-lg">{v}</p>
            <p className="text-xs text-[rgb(var(--fg-muted))]">{l}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-full border bg-[rgb(var(--bg-elevated))] px-5 py-3.5 focus-within:border-brand-500">
        <Search className="h-5 w-5 text-[rgb(var(--fg-muted))]" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by reference, title…" className="w-full bg-transparent text-sm outline-none" />
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn(
            "rounded-full border px-5 py-2 text-sm font-semibold capitalize",
            filter === f ? "border-transparent bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "bg-[rgb(var(--bg-elevated))] text-[rgb(var(--fg-muted))]"
          )}>{f}</button>
        ))}
      </div>

      {loading ? <p className="py-10 text-center text-sm text-[rgb(var(--fg-muted))]">Loading…</p>
        : error ? <p className="py-10 text-center text-sm text-red-500">Couldn&apos;t load transactions. Refresh to retry.</p>
        : shown.length === 0 ? <p className="py-10 text-center text-sm text-[rgb(var(--fg-muted))]">No transactions found</p>
        : <div className="space-y-3">{shown.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}</div>}
    </div>
  );
}
