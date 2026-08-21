"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { adminCustomersApi } from "@/lib/api/admin/customers";
import {AdminCustomer} from "@/lib/mock-data/admin";
import { formatNaira } from "@/lib/utils";
import { Wallet, Users } from "lucide-react";



const columns: Column<AdminCustomer>[] = [
  { key: "name", header: "Customer", render: (c) => c.name },
  { key: "email", header: "Email", render: (c) => <span className="text-ink-500 dark:text-paper-200/40">{c.email}</span> },
  { key: "walletBalance", header: "Balance", render: (c) => <span className="font-semibold">{formatNaira(c.walletBalance)}</span> },
  { key: "tier", header: "Tier", render: (c) => c.tier },
];

export default function AdminWalletsPage() {
  const { data: customers, isLoading } = useQuery({ queryKey: ["admin-customers"], queryFn: adminCustomersApi.list });
  const customerList = customers ?? [];
  console.log("customerList", customerList);
  const totalBalance = customerList.reduce((s, c) => s + c.walletBalance, 0);

  return (
    <AdminShell>
      <AdminPageHeading title="Wallets" subtitle="Manage customer wallet balances" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminStatCard label="Total wallet balance" value={formatNaira(totalBalance, { compact: true })} icon={Wallet} />
        <AdminStatCard label="Customers with a wallet" value={customerList.length.toString()} icon={Users} />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-ink-600 dark:text-paper-200/60">Customer wallets</h2>
        {isLoading ? (
          <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading customer wallets...</p>
        ) : (
          <AdminDataTable columns={columns} data={customerList} searchKeys={["name", "email"]} searchPlaceholder="Search customers..." />
        )}
      </div>
    </AdminShell>
  );
}