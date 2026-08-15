"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { Switch } from "@/components/ui/switch";
import { adminProductsApi, AdminProductRow } from "@/lib/api/admin/products";
import { formatNaira } from "@/lib/utils";
import { Package, PackageCheck, PackageX } from "lucide-react";

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: adminProductsApi.list });
  const list = products ?? [];

  const toggleStatus = async (id: string) => {
    try {
      await adminProductsApi.toggleStatus(id);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product status updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update product.");
    }
  };

  const columns: Column<AdminProductRow>[] = [
    { key: "name", header: "Product", render: (p) => <span className="font-semibold">{p.name}</span> },
    { key: "category", header: "Category", render: (p) => p.category },
    { key: "provider", header: "Provider", render: (p) => p.provider },
    { key: "costPrice", header: "Cost price", render: (p) => formatNaira(p.costPrice) },
    { key: "sellPrice", header: "Sell price", render: (p) => <span className="font-semibold">{formatNaira(p.sellPrice)}</span> },
    {
      key: "status",
      header: "Active",
      render: (p) => (
        <Switch checked={p.status === "active"} onCheckedChange={() => toggleStatus(p.id)} />
      ),
    },
  ];

  const active = list.filter((p) => p.status === "active").length;

  return (
    <AdminShell>
      <AdminPageHeading title="Products" subtitle="Every bill / service product sold on EasyBills" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total products" value={list.length.toString()} icon={Package} />
        <AdminStatCard label="Active" value={active.toString()} icon={PackageCheck} />
        <AdminStatCard label="Inactive" value={(list.length - active).toString()} icon={PackageX} />
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading products...</p>
        ) : (
          <AdminDataTable columns={columns} data={list} searchKeys={["name", "category", "provider"]} searchPlaceholder="Search products..." />
        )}
      </div>
    </AdminShell>
  );
}
