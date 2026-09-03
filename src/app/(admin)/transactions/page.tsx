"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Receipt } from "lucide-react";
import { getAdminTransactions, ApiRequestError } from "@/lib/api";
import type { Transaction } from "@/lib/types";
import { TransactionStatusBadge } from "@/components/status-badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatDate, formatNaira, cx } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All" },
  { id: "success", label: "Success" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(status: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminTransactions(status);
      setTransactions(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load transactions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filtered = useMemo(() => {
    if (!query.trim()) return transactions;
    const q = query.toLowerCase();
    return transactions.filter(
      (t) =>
        t.reference.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        (t.customerName || "").toLowerCase().includes(q)
    );
  }, [transactions, query]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Transactions</h1>
        <p className="mt-1 text-sm text-ink-faint">Every transaction processed on the platform</p>
      </div>

      <div className="rounded-2xl border border-line bg-surface shadow-card">
        <div className="flex flex-col gap-4 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-lg bg-base p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cx(
                  "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                  tab === t.id ? "bg-surface-hover text-ink" : "text-ink-faint hover:text-ink"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-sm sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by customer, reference, or service…"
              className="w-full rounded-lg border border-line bg-base py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {loading && <LoadingState label="Loading transactions…" />}
        {!loading && error && <ErrorState message={error} onRetry={() => load(tab)} />}
        {!loading && !error && filtered.length === 0 && (
          <div className="p-4">
            <EmptyState icon={Receipt} title="No transactions found" description="Nothing matches this filter yet." />
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-line-soft last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{t.reference}</td>
                    <td className="px-4 py-3 text-ink">{t.customerName || "—"}</td>
                    <td className="px-4 py-3 text-ink-muted">{t.title}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatNaira(t.amount)}</td>
                    <td className="px-4 py-3">
                      <TransactionStatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(t.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
