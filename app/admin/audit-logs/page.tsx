"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { adminAuditLogs, AdminAuditLog } from "@/lib/mock-data/admin";
import { formatDate } from "@/lib/utils";
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";

const columns: Column<AdminAuditLog>[] = [
  { key: "actor", header: "Actor", render: (l) => <span className="font-mono text-xs">{l.actor}</span> },
  { key: "action", header: "Action", render: (l) => <span className="font-semibold">{l.action}</span> },
  { key: "target", header: "Target", render: (l) => l.target },
  { key: "ipAddress", header: "IP address", render: (l) => <span className="font-mono text-xs text-ink-500 dark:text-paper-200/40">{l.ipAddress}</span> },
  { key: "timestamp", header: "Timestamp", render: (l) => formatDate(l.timestamp) },
];

export default function AdminAuditLogsPage() {
  return (
    <AdminShell>
      <AdminPageHeading title="Audit Logs" subtitle="A record of every sensitive admin action taken" />

      <PreviewDataBanner feature="Audit Logs" />
      <AdminDataTable columns={columns} data={adminAuditLogs} searchKeys={["actor", "action", "target"]} searchPlaceholder="Search audit logs..." />
    </AdminShell>
  );
}
