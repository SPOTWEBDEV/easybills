"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { adminCommissions, AdminCommission } from "@/lib/mock-data/admin";
import { formatDate, formatNaira } from "@/lib/utils";
import { Percent, Wallet, Clock, CheckCircle2 } from "lucide-react";
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";

const columns: Column<AdminCommission>[] = [
  { key: "agentName", header: "Agent", render: (c) => c.agentName },
  { key: "reference", header: "Reference", render: (c) => <span className="font-mono text-xs">{c.reference}</span> },
  { key: "service", header: "Service", render: (c) => c.service },
  { key: "rate", header: "Rate", render: (c) => c.rate },
  { key: "amount", header: "Commission", render: (c) => formatNaira(c.amount) },
  { key: "status", header: "Status", render: (c) => <StatusPill status={c.status} /> },
  { key: "date", header: "Date", render: (c) => formatDate(c.date) },
];

export default function AdminCommissionsPage() {
  const total = adminCommissions.reduce((s, c) => s + c.amount, 0);
  const paid = adminCommissions.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);
  const pending = adminCommissions.filter((c) => c.status === "pending").reduce((s, c) => s + c.amount, 0);

  return (
    <AdminShell>
      <AdminPageHeading title="Commissions" subtitle="Track what agents have earned across every sale" />

      <PreviewDataBanner feature="Commissions" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total commission" value={formatNaira(total)} icon={Percent} />
        <AdminStatCard label="Paid out" value={formatNaira(paid)} icon={CheckCircle2} />
        <AdminStatCard label="Pending payout" value={formatNaira(pending)} icon={Clock} />
        <AdminStatCard label="Avg. commission rate" value="2.8%" icon={Wallet} />
      </div>

      <div className="mt-6">
        <AdminDataTable columns={columns} data={adminCommissions} searchKeys={["agentName", "reference", "service"]} searchPlaceholder="Search commissions..." />
      </div>
    </AdminShell>
  );
}
