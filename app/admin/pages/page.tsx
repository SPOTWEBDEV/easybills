"use client";

import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { adminPages, AdminPage } from "@/lib/mock-data/admin";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

const columns: Column<AdminPage>[] = [
  { key: "title", header: "Page", render: (p) => <span className="font-semibold">{p.title}</span> },
  { key: "slug", header: "URL", render: (p) => <span className="font-mono text-xs text-ink-500 dark:text-paper-200/40">{p.slug}</span> },
  { key: "status", header: "Status", render: (p) => <StatusPill status={p.status} /> },
  { key: "updatedAt", header: "Last updated", render: (p) => formatDate(p.updatedAt) },
];

export default function AdminPagesPage() {
  return (
    <AdminShell>
      <AdminPageHeading
        title="Pages"
        subtitle="Manage static site pages (About, Terms, Privacy, and more)"
        action={
          <Button onClick={() => toast("New page editor would open here")}>
            <Plus className="h-4 w-4" /> New page
          </Button>
        }
      />
      <PreviewDataBanner feature="Pages (CMS)" />
      <AdminDataTable columns={columns} data={adminPages} searchKeys={["title", "slug"]} searchPlaceholder="Search pages..." />
    </AdminShell>
  );
}
