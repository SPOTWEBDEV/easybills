"use client";

import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminReports, AdminReport } from "@/lib/mock-data/admin";
import { formatDate } from "@/lib/utils";
import { Download, FileBarChart } from "lucide-react";
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";

export default function AdminReportsPage() {
  const handleDownload = (report: AdminReport) => {
    const content = `EasyBills — ${report.name}\nType: ${report.type}\nDate range: ${report.dateRange}\nGenerated: ${formatDate(report.generatedAt)}\n`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, "-").toLowerCase()}.${report.format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const columns: Column<AdminReport>[] = [
    { key: "name", header: "Report", render: (r) => <div className="flex items-center gap-2.5"><FileBarChart className="h-4 w-4 text-brand-600 dark:text-brand-300" /><span className="font-semibold">{r.name}</span></div> },
    { key: "type", header: "Type", render: (r) => r.type },
    { key: "dateRange", header: "Date range", render: (r) => r.dateRange },
    { key: "format", header: "Format", render: (r) => <Badge variant="neutral">{r.format}</Badge> },
    { key: "generatedAt", header: "Generated", render: (r) => formatDate(r.generatedAt) },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Button size="sm" variant="outline" onClick={() => handleDownload(r)}>
          <Download className="h-3.5 w-3.5" /> Download
        </Button>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeading title="Reports" subtitle="Generated reports ready for download" />

      <PreviewDataBanner feature="Reports" />
      <AdminDataTable columns={columns} data={adminReports} searchKeys={["name", "type"]} searchPlaceholder="Search reports..." />
    </AdminShell>
  );
}
