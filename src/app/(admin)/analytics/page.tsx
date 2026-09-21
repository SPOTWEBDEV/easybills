"use client";

import { useEffect, useState } from "react";
import { getRevenueTrend, getTopServices, getDashboardStats, ApiRequestError } from "@/lib/api";
import type { RevenueTrendPoint, TopService, DashboardStats } from "@/lib/types";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { TopServicesDonut } from "@/components/charts/top-services-donut";
import { LoadingState, ErrorState } from "@/components/states";
import { formatCompactNaira } from "@/lib/utils";

export default function AnalyticsPage() {
  const [trend, setTrend] = useState<RevenueTrendPoint[]>([]);
  const [services, setServices] = useState<TopService[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [t, s, d] = await Promise.all([getRevenueTrend(), getTopServices(), getDashboardStats()]);
      setTrend(t.data);
      setServices(s.data);
      setStats(d);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const avgMonthlyRevenue = trend.length
    ? trend.reduce((sum, p) => sum + p.revenue, 0) / trend.length
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-ink-faint">Deeper look at revenue and service mix</p>
      </div>

      {loading && <LoadingState label="Loading analytics…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">Revenue, last 7 months</h2>
              <p className="text-sm text-ink-faint">
                Avg <span className="text-ink">{formatCompactNaira(avgMonthlyRevenue)}</span> / month
              </p>
            </div>
            {trend.length ? (
              <RevenueChart data={trend} />
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-ink-faint">Not enough data yet</div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="mb-4 font-display text-base font-semibold text-ink">Service mix</h2>
            {services.length ? (
              <TopServicesDonut data={services} />
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-ink-faint">Not enough data yet</div>
            )}
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-4 lg:col-span-3 lg:grid-cols-4">
              {[
                ["Total revenue", formatCompactNaira(stats.revenue)],
                ["Total sales", stats.sales],
                ["Transactions", stats.transactions],
                ["Active users", stats.activeUsers],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-2xl border border-line bg-surface p-5">
                  <p className="text-xs text-ink-faint">{label}</p>
                  <p className="mt-1 font-display text-xl font-bold text-ink">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
