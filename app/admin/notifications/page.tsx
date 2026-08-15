"use client";

import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminNotificationLogs, AdminNotificationLog } from "@/lib/mock-data/admin";
import { formatDate } from "@/lib/utils";
import { Send } from "lucide-react";

const columns: Column<AdminNotificationLog>[] = [
  { key: "title", header: "Notification", render: (n) => <span className="font-semibold">{n.title}</span> },
  { key: "channel", header: "Channel", render: (n) => <Badge variant="neutral" className="uppercase">{n.channel}</Badge> },
  { key: "sentTo", header: "Recipients", render: (n) => n.sentTo.toLocaleString() },
  { key: "status", header: "Status", render: (n) => <StatusPill status={n.status} /> },
  { key: "sentAt", header: "Sent", render: (n) => formatDate(n.sentAt) },
];

export default function AdminNotificationsPage() {
  return (
    <AdminShell>
      <AdminPageHeading
        title="Notifications"
        subtitle="Push, email, and SMS notifications sent from EasyBills"
        action={
          <Button onClick={() => toast("New notification composer would open here")}>
            <Send className="h-4 w-4" /> Send notification
          </Button>
        }
      />
      <PreviewDataBanner feature="Notifications" />
      <AdminDataTable columns={columns} data={adminNotificationLogs} searchKeys={["title"]} searchPlaceholder="Search notification logs..." />
    </AdminShell>
  );
}
