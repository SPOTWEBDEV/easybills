"use client";

import { useEffect, useState } from "react";
import { getRevenueTrend, getDashboardStats, ApiRequestError } from "@/lib/api";
import type { RevenueTrendPoint, DashboardStats } from "@/lib/types";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { LoadingState, ErrorState } from "@/components/states";
import { formatCompactNaira, formatNaira } from "@/lib/utils";

export default function RevenuePage() {
  const [trend, setTrend] = useState<RevenueTrendPoint[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [t, s] = await Promise.all([getRevenueTrend(), getDashboardStats()]);
      setTrend(t.data);
      setStats(s);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load revenue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const best = trend.reduce<RevenueTrendPoint | null>(
    (max, p) => (!max || p.revenue > max.revenue ? p : max),
    null
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Revenue</h1>
        <p className="mt-1 text-sm text-ink-faint">Track how revenue has moved month over month</p>
      </div>

      {loading && <LoadingState label="Loading revenue…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <p className="text-sm text-ink-faint">Total revenue (all time)</p>
              <p className="mt-2 font-display text-3xl font-bold text-ink">
                {formatNaira(stats?.revenue ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <p className="text-sm text-ink-faint">Best month</p>
              <p className="mt-2 font-display text-3xl font-bold text-ink">
                {best ? formatCompactNaira(best.revenue) : "—"}
              </p>
              <p className="mt-1 text-xs text-ink-faint">{best?.month || "No data yet"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h2 className="mb-4 font-display text-base font-semibold text-ink">Monthly revenue</h2>
            {trend.length ? (
              <RevenueChart data={trend} />
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-ink-faint">Not enough data yet</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
