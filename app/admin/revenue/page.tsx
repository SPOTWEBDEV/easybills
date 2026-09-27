"use client";

import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminDashboardApi, TopServiceSlice } from "@/lib/api/admin/dashboard";
import { formatNaira } from "@/lib/utils";
import { DollarSign } from "lucide-react";

const columns: Column<TopServiceSlice & { id: string }>[] = [
  { key: "name", header: "Category", render: (r) => <span className="font-semibold">{r.name}</span> },
  { key: "value", header: "% of transaction volume", render: (r) => `${r.value}%` },
];

export default function AdminRevenuePage() {
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: adminDashboardApi.stats });
  const { data: revenueTrend } = useQuery({ queryKey: ["admin-revenue-trend"], queryFn: adminDashboardApi.revenueTrend });
  const { data: topServices } = useQuery({ queryKey: ["admin-top-services"], queryFn: adminDashboardApi.topServices });

  return (
    <AdminShell>
      <AdminPageHeading title="Revenue" subtitle="Where EasyBills revenue is coming from" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
        <AdminStatCard
          label="Total revenue"
          value={stats ? formatNaira(stats.revenue, { compact: true }) : "—"}
          icon={DollarSign}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Revenue over time</CardTitle>
        </CardHeader>
        <CardContent className="h-72 pt-4">
          {!revenueTrend || revenueTrend.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-ink-400 dark:text-paper-200/30">
              Not enough data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revFill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0EA894" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0EA894" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatNaira(v, { compact: true })} width={64} />
                <Tooltip formatter={(v: number) => formatNaira(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#0EA894" strokeWidth={2.5} fill="url(#revFill2)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-ink-600 dark:text-paper-200/60">Revenue mix by category</h2>
        <AdminDataTable
          columns={columns}
          data={(topServices ?? []).map((s) => ({ ...s, id: s.name }))}
        />
      </div>
    </AdminShell>
  );
}
