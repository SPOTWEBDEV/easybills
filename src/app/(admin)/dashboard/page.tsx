"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, Receipt, Users } from "lucide-react";
import { getDashboardStats, getRevenueTrend, getTopServices, ApiRequestError } from "@/lib/api";
import type { DashboardStats, RevenueTrendPoint, TopService } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { TopServicesDonut } from "@/components/charts/top-services-donut";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatCompactNaira } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<RevenueTrendPoint[]>([]);
  const [services, setServices] = useState<TopService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, r, t] = await Promise.all([getDashboardStats(), getRevenueTrend(), getTopServices()]);
      setStats(s);
      setTrend(r.data);
      setServices(t.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load the dashboard.");
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
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-faint">Overview of EasyBills performance</p>
      </div>

      {loading && <LoadingState label="Loading dashboard…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && stats && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total revenue" value={formatCompactNaira(stats.revenue)} icon={DollarSign} tone="brand" />
            <StatCard label="Total sales" value={stats.sales} icon={ShoppingCart} />
            <StatCard label="Transactions" value={stats.transactions} icon={Receipt} />
            <StatCard label="Active users" value={stats.activeUsers} icon={Users} tone="good" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-card lg:col-span-2">
              <h2 className="mb-4 font-display text-base font-semibold text-ink">Revenue trend</h2>
              {trend.length ? (
                <RevenueChart data={trend} />
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-ink-faint">
                  Not enough data yet
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <h2 className="mb-4 font-display text-base font-semibold text-ink">Top services</h2>
              {services.length ? (
                <TopServicesDonut data={services} />
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-ink-faint">
                  Not enough data yet
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!loading && !error && !stats && (
        <EmptyState icon={Receipt} title="No dashboard data yet" description="Once transactions start coming in, your overview will appear here." />
      )}
    </div>
  );
}
