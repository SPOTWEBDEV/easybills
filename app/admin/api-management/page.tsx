"use client";

import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { adminApiKeys, AdminApiKey } from "@/lib/mock-data/admin";
import { formatDate } from "@/lib/utils";
import { Plus, Copy } from "lucide-react";

export default function AdminApiManagementPage() {
  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const columns: Column<AdminApiKey>[] = [
    { key: "label", header: "Label", render: (k) => <span className="font-semibold">{k.label}</span> },
    {
      key: "keyPreview",
      header: "Key",
      render: (k) => (
        <button onClick={() => copyKey(k.keyPreview)} className="flex items-center gap-1.5 font-mono text-xs text-ink-500 dark:text-paper-200/40 hover:text-brand-600 dark:hover:text-brand-300">
          {k.keyPreview} <Copy className="h-3 w-3" />
        </button>
      ),
    },
    { key: "status", header: "Status", render: (k) => <StatusPill status={k.status} /> },
    { key: "createdAt", header: "Created", render: (k) => formatDate(k.createdAt) },
    { key: "lastUsed", header: "Last used", render: (k) => formatDate(k.lastUsed) },
  ];

  return (
    <AdminShell>
      <AdminPageHeading
        title="API Management"
        subtitle="Keys used to access the EasyBills API"
        action={
          <Button onClick={() => toast("New API key generated")}>
            <Plus className="h-4 w-4" /> Generate key
          </Button>
        }
      />
      <PreviewDataBanner feature="API Management" />
      <AdminDataTable columns={columns} data={adminApiKeys} searchKeys={["label"]} searchPlaceholder="Search API keys..." />
    </AdminShell>
  );
}
