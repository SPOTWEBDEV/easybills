"use client";

import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { adminAnnouncements, AdminAnnouncement } from "@/lib/mock-data/admin";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

const columns: Column<AdminAnnouncement>[] = [
  { key: "title", header: "Title", render: (a) => <span className="font-semibold">{a.title}</span> },
  { key: "audience", header: "Audience", render: (a) => a.audience },
  { key: "status", header: "Status", render: (a) => <StatusPill status={a.status} /> },
  { key: "publishedAt", header: "Date", render: (a) => formatDate(a.publishedAt) },
];

export default function AdminAnnouncementsPage() {
  return (
    <AdminShell>
      <AdminPageHeading
        title="Announcements"
        subtitle="Broadcast messages to users, agents, or new sign-ups"
        action={
          <Button onClick={() => toast("New announcement form would open here")}>
            <Plus className="h-4 w-4" /> New announcement
          </Button>
        }
      />
      <PreviewDataBanner feature="Announcements" />
      <AdminDataTable columns={columns} data={adminAnnouncements} searchKeys={["title", "audience"]} searchPlaceholder="Search announcements..." />
    </AdminShell>
  );
}
