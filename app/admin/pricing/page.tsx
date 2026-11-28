"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { Badge } from "@/components/ui/badge";
import { adminPricingApi, AdminPricingRow } from "@/lib/api/admin/pricing";
import { NOT_APPLIED_SERVICES, fmtDateTime, serviceLabel } from "@/lib/admin-format";

const columns: Column<AdminPricingRow>[] = [
  {
    key: "service", header: "Service category",
    render: (p) => (
      <div className="flex items-center gap-2">
        <span className="font-semibold">{serviceLabel(p.service)}</span>
        {NOT_APPLIED_SERVICES.includes(p.service) && <Badge variant="neutral">Not applied</Badge>}
      </div>
    ),
  },
  { key: "marginType", header: "Margin type", render: (p) => <span className="capitalize">{p.marginType}</span> },
  { key: "marginValue", header: "Margin value", render: (p) => (p.marginType === "fixed" ? `₦${p.marginValue}` : `${p.marginValue}%`) },
  { key: "updatedAt", header: "Last updated", render: (p) => fmtDateTime(p.updatedAt) },
];

export default function AdminPricingPage() {
  const { data: rules, isLoading } = useQuery({ queryKey: ["admin-pricing"], queryFn: adminPricingApi.list });

  return (
    <AdminShell>
      <AdminPageHeading
        title="Pricing"
        subtitle="Current margin rule per service category"
        action={
          <Link href="/admin/pricing/edit" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">
            <Pencil className="h-4 w-4" />
            Edit margins
          </Link>
        }
      />
      {isLoading ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading pricing rules...</p>
      ) : (
        <AdminDataTable columns={columns} data={rules ?? []} searchKeys={["service"]} searchPlaceholder="Search pricing rules..." />
      )}
    </AdminShell>
  );
}
