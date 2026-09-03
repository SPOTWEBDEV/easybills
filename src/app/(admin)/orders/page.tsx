"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Ticket } from "lucide-react";
import { getAdminTransactions, ApiRequestError } from "@/lib/api";
import type { Transaction } from "@/lib/types";
import { TransactionStatusBadge } from "@/components/status-badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatDate, formatNaira } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  airtime: "Airtime",
  data: "Data",
  electricity: "Electricity",
  cable: "Cable TV",
};

export default function OrdersPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminTransactions();
      setTransactions(res.data.filter((t) => t.category !== "wallet-funding"));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return transactions;
    const q = query.toLowerCase();
    return transactions.filter(
      (t) =>
        t.reference.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.recipient?.toLowerCase().includes(q)
    );
  }, [transactions, query]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Orders</h1>
        <p className="mt-1 text-sm text-ink-faint">Airtime, data, electricity and cable purchases</p>
      </div>

      <div className="rounded-2xl border border-line bg-surface shadow-card">
        <div className="border-b border-line p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by reference, service or recipient…"
              className="w-full rounded-lg border border-line bg-base py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {loading && <LoadingState label="Loading orders…" />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && filtered.length === 0 && (
          <div className="p-4">
            <EmptyState icon={Ticket} title="No orders yet" description="Service purchases will show up here as customers buy airtime, data, electricity, and cable TV." />
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Recipient</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-line-soft last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{t.reference}</td>
                    <td className="px-4 py-3 text-ink">{CATEGORY_LABEL[t.category] || t.title}</td>
                    <td className="px-4 py-3 text-ink-muted">{t.recipient}</td>
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
