"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { adminActivityLogs, AdminActivityLog } from "@/lib/mock-data/admin";
import { formatDate } from "@/lib/utils";
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";

const columns: Column<AdminActivityLog>[] = [
  { key: "user", header: "User", render: (l) => <span className="font-semibold">{l.user}</span> },
  { key: "action", header: "Action", render: (l) => l.action },
  { key: "device", header: "Device", render: (l) => <span className="text-ink-500 dark:text-paper-200/40">{l.device}</span> },
  { key: "timestamp", header: "Timestamp", render: (l) => formatDate(l.timestamp) },
];

export default function AdminActivityLogsPage() {
  return (
    <AdminShell>
      <AdminPageHeading title="Activity Logs" subtitle="Recent user activity across the platform" />

      <PreviewDataBanner feature="Activity Logs" />
      <AdminDataTable columns={columns} data={adminActivityLogs} searchKeys={["user", "action"]} searchPlaceholder="Search activity logs..." />
    </AdminShell>
  );
}
