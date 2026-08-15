"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Badge } from "@/components/ui/badge";
import { adminAgents, AdminAgent } from "@/lib/mock-data/admin";
import { formatDate, formatNaira } from "@/lib/utils";
import { UserCog, TrendingUp, Award, Clock } from "lucide-react";
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";

const tierColor: Record<AdminAgent["tier"], "brand" | "neutral" | "pending"> = {
  Gold: "pending",
  Silver: "neutral",
  Bronze: "brand",
};

const columns: Column<AdminAgent>[] = [
  { key: "name", header: "Agent", render: (a) => <div><p className="font-semibold">{a.name}</p><p className="text-xs text-ink-500 dark:text-paper-200/40">{a.email}</p></div> },
  { key: "tier", header: "Tier", render: (a) => <Badge variant={tierColor[a.tier]}>{a.tier}</Badge> },
  { key: "totalSales", header: "Total sales", render: (a) => formatNaira(a.totalSales, { compact: true }) },
  { key: "commissionEarned", header: "Commission earned", render: (a) => formatNaira(a.commissionEarned) },
  { key: "status", header: "Status", render: (a) => <StatusPill status={a.status} /> },
  { key: "joinedAt", header: "Joined", render: (a) => formatDate(a.joinedAt) },
];

export default function AdminAgentsPage() {
  const active = adminAgents.filter((a) => a.status === "active").length;
  const totalCommission = adminAgents.reduce((s, a) => s + a.commissionEarned, 0);
  const gold = adminAgents.filter((a) => a.tier === "Gold").length;

  return (
    <AdminShell>
      <AdminPageHeading title="Agents" subtitle="Everyone reselling EasyBills services" />

      <PreviewDataBanner feature="Agents" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total agents" value={adminAgents.length.toString()} icon={UserCog} />
        <AdminStatCard label="Active agents" value={active.toString()} icon={Clock} />
        <AdminStatCard label="Gold tier agents" value={gold.toString()} icon={Award} />
        <AdminStatCard label="Total commission paid" value={formatNaira(totalCommission, { compact: true })} icon={TrendingUp} />
      </div>

      <div className="mt-6">
        <AdminDataTable columns={columns} data={adminAgents} searchKeys={["name", "email"]} searchPlaceholder="Search agents..." />
      </div>
    </AdminShell>
  );
}
