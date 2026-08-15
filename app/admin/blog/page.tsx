"use client";

import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { adminBlogPosts, AdminBlogPost } from "@/lib/mock-data/admin";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

const columns: Column<AdminBlogPost>[] = [
  { key: "title", header: "Title", render: (b) => <span className="font-semibold">{b.title}</span> },
  { key: "author", header: "Author", render: (b) => b.author },
  { key: "views", header: "Views", render: (b) => b.views.toLocaleString() },
  { key: "status", header: "Status", render: (b) => <StatusPill status={b.status} /> },
  { key: "publishedAt", header: "Published", render: (b) => (b.views > 0 ? formatDate(b.publishedAt) : "—") },
];

export default function AdminBlogPage() {
  return (
    <AdminShell>
      <AdminPageHeading
        title="Blog"
        subtitle="Manage articles published on the EasyBills blog"
        action={
          <Button onClick={() => toast("New post editor would open here")}>
            <Plus className="h-4 w-4" /> New post
          </Button>
        }
      />
      <PreviewDataBanner feature="Blog" />
      <AdminDataTable columns={columns} data={adminBlogPosts} searchKeys={["title", "author"]} searchPlaceholder="Search posts..." />
    </AdminShell>
  );
}
