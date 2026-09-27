"use client";

import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Info } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminDashboardApi } from "@/lib/api/admin/dashboard";
import { formatNaira } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const { data: revenueTrend } = useQuery({ queryKey: ["admin-revenue-trend"], queryFn: adminDashboardApi.revenueTrend });
  const { data: topServices } = useQuery({ queryKey: ["admin-top-services"], queryFn: adminDashboardApi.topServices });

  return (
    <AdminShell>
      <AdminPageHeading title="Analytics" subtitle="Deeper performance metrics across the platform" />

      <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-brand-200 dark:border-brand-500/30 bg-brand-50 dark:bg-brand-500/10 p-4 text-sm text-brand-900 dark:text-brand-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Conversion rate, repeat-purchase rate, and cohort metrics need dedicated tracking that
          isn&apos;t built yet — the two charts below are real, live data from the transactions table.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs. sales volume</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            {!revenueTrend || revenueTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-ink-400 dark:text-paper-200/30">
                Not enough data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatNaira(v, { compact: true })} width={64} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#0EA894" strokeWidth={2.5} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="sales" name="Sales count" stroke="#22A559" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service mix (% of volume)</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            {!topServices || topServices.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-ink-400 dark:text-paper-200/30">
                Not enough data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServices} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.15)" />
                  <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="value" fill="#0EA894" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
