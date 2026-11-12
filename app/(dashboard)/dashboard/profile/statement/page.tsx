"use client";
import { useMemo, useState } from "react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { TransactionRow } from "@/components/dashboard/transaction-row";
import { useApiData } from "@/hooks/use-api-data";
import { transactionsApi } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { isCreditCategory } from "@/lib/tx";
import { cn, formatNaira } from "@/lib/utils";

const PERIODS = [
  { key: "7d", label: "7 days", days: 7 }, { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 }, { key: "all", label: "All time", days: 3650 },
] as const;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };

export default function StatementPage() {
  const [period, setPeriod] = useState<string>("30d");
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(iso(new Date()));
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const { data, loading } = useApiData(() => transactionsApi.list());

  const inRange = useMemo(
    () => (data ?? []).filter((t) => { const d = t.date.slice(0, 10); return d >= from && d <= to; }),
    [data, from, to]
  );
  const done = inRange.filter((t) => t.status === "success");
  const moneyIn = done.filter((t) => isCreditCategory(t.category)).reduce((s, t) => s + t.amount, 0);
  const moneyOut = done.filter((t) => !isCreditCategory(t.category)).reduce((s, t) => s + t.amount, 0);

  const onDownload = async () => {
    setError(""); setDownloading(true);
    try { await transactionsApi.downloadStatement({ from, to }); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Couldn't download. Please try again."); }
    finally { setDownloading(false); }
  };

  return (
    <div className="space-y-6">
      <SubPageHeader title="Statement of Account" subtitle="Download a record of your activity" back="/dashboard/profile" />

      <div className="grid grid-cols-4 gap-2">
        {PERIODS.map((p) => (
          <button key={p.key} onClick={() => { setPeriod(p.key); setFrom(daysAgo(p.days)); setTo(iso(new Date())); }}
            className={cn("rounded-full border py-2.5 text-xs font-bold", period === p.key ? "border-brand-500 bg-brand-500 text-white" : "bg-[rgb(var(--bg-elevated))] text-[rgb(var(--fg-muted))]")}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {([["From", from, setFrom], ["To", to, setTo]] as const).map(([l, v, set]) => (
          <label key={l} className="space-y-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">
            {l}
            <input type="date" value={v} max={iso(new Date())} onChange={(e) => { set(e.target.value); setPeriod(""); }}
              className="block w-full rounded-xl border bg-[rgb(var(--bg-elevated))] px-3 py-3 text-sm font-semibold normal-case tracking-normal text-[rgb(var(--fg))] outline-none focus:border-brand-500" />
          </label>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[[String(inRange.length), "Transactions", ""], [formatNaira(moneyIn), "Money in", "text-emerald-500"], [formatNaira(moneyOut), "Money out", "text-red-500"]].map(([v, l, c]) => (
          <div key={l} className="rounded-2xl border bg-[rgb(var(--bg-elevated))] px-2 py-4">
            <p className={cn("font-display text-sm font-bold sm:text-lg", c)}>{v}</p>
            <p className="text-xs text-[rgb(var(--fg-muted))]">{l}</p>
          </div>
        ))}
      </div>

      <button onClick={onDownload} disabled={downloading} className="w-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 py-3.5 text-sm font-bold text-white shadow-glow disabled:opacity-60">
        {downloading ? "Preparing…" : "Download statement (CSV)"}
      </button>
      {error && <p className="text-center text-sm text-red-500">{error}</p>}

      <section>
        <h2 className="mb-3 font-display text-base font-bold">Preview</h2>
        {loading ? <p className="text-sm text-[rgb(var(--fg-muted))]">Loading…</p>
          : inRange.length === 0 ? <p className="py-6 text-center text-sm text-[rgb(var(--fg-muted))]">No transactions in this period</p>
          : <div className="space-y-3">{inRange.slice(0, 4).map((tx) => <TransactionRow key={tx.id} tx={tx} />)}</div>}
      </section>
    </div>
  );
}
