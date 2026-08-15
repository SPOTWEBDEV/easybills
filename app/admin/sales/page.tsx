"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/admin/status-pill";
import { adminDashboardApi } from "@/lib/api/admin/dashboard";
import { adminTransactionsApi, AdminTransactionRow } from "@/lib/api/admin/transactions";
import { formatDate, formatNaira } from "@/lib/utils";
import { ShoppingCart, PackageCheck, PackageX, Clock } from "lucide-react";

const columns: Column<AdminTransactionRow>[] = [
  { key: "reference", header: "Reference", render: (o) => <span className="font-mono text-xs">{o.reference}</span> },
  { key: "customer", header: "Customer", render: (o) => o.customer },
  { key: "service", header: "Service", render: (o) => o.service },
  { key: "amount", header: "Amount", render: (o) => formatNaira(o.amount) },
  { key: "status", header: "Status", render: (o) => <StatusPill status={o.status} /> },
  { key: "date", header: "Date", render: (o) => formatDate(o.date) },
];

export default function AdminSalesPage() {
  const { data: orders, isLoading } = useQuery({ queryKey: ["admin-sales"], queryFn: () => adminTransactionsApi.list() });
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: adminDashboardApi.stats });
  const { data: revenueTrend } = useQuery({ queryKey: ["admin-revenue-trend"], queryFn: adminDashboardApi.revenueTrend });

  const list = orders ?? [];
  const successCount = list.filter((o) => o.status === "success").length;
  const pendingCount = list.filter((o) => o.status === "pending").length;
  const failedCount = list.filter((o) => o.status === "failed").length;

  return (
    <AdminShell>
      <AdminPageHeading title="Sales" subtitle="Every sale processed across EasyBills" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total sales" value={stats ? stats.sales.toLocaleString() : "—"} icon={ShoppingCart} />
        <AdminStatCard label="Successful" value={successCount.toString()} icon={PackageCheck} />
        <AdminStatCard label="Pending" value={pendingCount.toString()} icon={Clock} />
        <AdminStatCard label="Failed" value={failedCount.toString()} icon={PackageX} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sales volume by month</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          {!revenueTrend || revenueTrend.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-ink-400 dark:text-paper-200/30">
              Not enough data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip />
                <Bar dataKey="sales" fill="#22A559" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading sales...</p>
        ) : (
          <AdminDataTable columns={columns} data={list} searchKeys={["customer", "reference", "service"]} searchPlaceholder="Search sales..." />
        )}
      </div>
    </AdminShell>
  );
}
