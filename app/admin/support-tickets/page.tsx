"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { adminTickets, AdminTicket } from "@/lib/mock-data/admin";
import { formatDate } from "@/lib/utils";
import { Headphones, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";

const columns: Column<AdminTicket>[] = [
  { key: "subject", header: "Subject", render: (t) => <span className="font-semibold">{t.subject}</span> },
  { key: "customer", header: "Customer", render: (t) => t.customer },
  { key: "priority", header: "Priority", render: (t) => <StatusPill status={t.priority} /> },
  { key: "status", header: "Status", render: (t) => <StatusPill status={t.status} /> },
  { key: "assignedTo", header: "Assigned to", render: (t) => t.assignedTo },
  { key: "updatedAt", header: "Updated", render: (t) => formatDate(t.updatedAt) },
];

export default function AdminSupportTicketsPage() {
  const open = adminTickets.filter((t) => t.status === "open").length;
  const inProgress = adminTickets.filter((t) => t.status === "in_progress").length;
  const resolved = adminTickets.filter((t) => t.status === "resolved").length;

  return (
    <AdminShell>
      <AdminPageHeading title="Support Tickets" subtitle="Customer issues awaiting resolution" />

      <PreviewDataBanner feature="Support Tickets" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total tickets" value={adminTickets.length.toString()} icon={Headphones} />
        <AdminStatCard label="Open" value={open.toString()} icon={AlertCircle} />
        <AdminStatCard label="In progress" value={inProgress.toString()} icon={Clock} />
        <AdminStatCard label="Resolved" value={resolved.toString()} icon={CheckCircle2} />
      </div>

      <div className="mt-6">
        <AdminDataTable columns={columns} data={adminTickets} searchKeys={["subject", "customer"]} searchPlaceholder="Search tickets..." />
      </div>
    </AdminShell>
  );
}
