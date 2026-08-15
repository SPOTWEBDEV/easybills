"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { adminPricingApi, AdminPricingRow } from "@/lib/api/admin/pricing";
import { formatDate } from "@/lib/utils";

const columns: Column<AdminPricingRow>[] = [
  { key: "service", header: "Service category", render: (p) => <span className="font-semibold capitalize">{p.service.replace(/-/g, " ")}</span> },
  { key: "marginType", header: "Margin type", render: (p) => <span className="capitalize">{p.marginType}</span> },
  { key: "marginValue", header: "Margin value", render: (p) => (p.marginType === "fixed" ? `₦${p.marginValue}` : `${p.marginValue}%`) },
  { key: "updatedAt", header: "Last updated", render: (p) => formatDate(p.updatedAt) },
];

export default function AdminPricingPage() {
  const { data: rules, isLoading } = useQuery({ queryKey: ["admin-pricing"], queryFn: adminPricingApi.list });

  return (
    <AdminShell>
      <AdminPageHeading
        title="Pricing"
        subtitle="Current margin rule per service category — edit these in Profit Settings"
      />
      {isLoading ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading pricing rules...</p>
      ) : (
        <AdminDataTable columns={columns} data={rules ?? []} searchKeys={["service"]} searchPlaceholder="Search pricing rules..." />
      )}
    </AdminShell>
  );
}
