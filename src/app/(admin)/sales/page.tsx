"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { getDashboardStats, getTopServices, getAdminTransactions, ApiRequestError } from "@/lib/api";
import type { DashboardStats, TopService, Transaction } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { TopServicesDonut } from "@/components/charts/top-services-donut";
import { TransactionStatusBadge } from "@/components/status-badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatDate, formatNaira } from "@/lib/utils";

export default function SalesPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [services, setServices] = useState<TopService[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, t, txns] = await Promise.all([
        getDashboardStats(),
        getTopServices(),
        getAdminTransactions("success"),
      ]);
      setStats(s);
      setServices(t.data);
      setRecent(txns.data.filter((t) => t.category !== "wallet-funding").slice(0, 8));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load sales.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Sales</h1>
        <p className="mt-1 text-sm text-ink-faint">Completed service sales across the platform</p>
      </div>

      {loading && <LoadingState label="Loading sales…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <StatCard label="Total sales" value={stats?.sales ?? 0} icon={ShoppingCart} tone="brand" />
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card lg:col-span-2">
            <h2 className="mb-4 font-display text-base font-semibold text-ink">Sales by service</h2>
            {services.length ? (
              <TopServicesDonut data={services} />
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-ink-faint">Not enough data yet</div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-surface shadow-card lg:col-span-3">
            <div className="border-b border-line p-4">
              <h2 className="font-display text-base font-semibold text-ink">Recent successful sales</h2>
            </div>
            {recent.length === 0 ? (
              <div className="p-4">
                <EmptyState icon={ShoppingCart} title="No sales yet" description="Completed airtime, data, electricity and cable sales will appear here." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Service</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((t) => (
                      <tr key={t.id} className="border-b border-line-soft last:border-0 hover:bg-surface-hover">
                        <td className="px-4 py-3 font-mono text-xs text-ink-muted">{t.reference}</td>
                        <td className="px-4 py-3 text-ink">{t.title}</td>
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
      )}
    </div>
  );
}
