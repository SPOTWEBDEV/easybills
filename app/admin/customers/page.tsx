"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { adminCustomersApi } from "@/lib/api/admin/customers";
import { AdminCustomer } from "@/lib/mock-data/admin";
import { formatDate, formatNaira } from "@/lib/utils";
import { Users, UserCheck, ShieldAlert, UserX } from "lucide-react";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const columns: Column<AdminCustomer>[] = [
  {
    key: "name",
    header: "Customer",
    render: (c) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-[11px]">{initials(c.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{c.name}</p>
          <p className="text-xs text-ink-500 dark:text-paper-200/40">{c.email}</p>
        </div>
      </div>
    ),
  },
  { key: "phone", header: "Phone", render: (c) => c.phone },
  { key: "walletBalance", header: "Balance", render: (c) => formatNaira(c.walletBalance) },
  { key: "tier", header: "Tier", render: (c) => c.tier },
  { key: "kycStatus", header: "KYC", render: (c) => <StatusPill status={c.kycStatus} /> },
  { key: "status", header: "Status", render: (c) => <StatusPill status={c.status} /> },
  { key: "joinedAt", header: "Joined", render: (c) => formatDate(c.joinedAt) },
];

export default function AdminCustomersPage() {
  const { data: customers, isLoading } = useQuery({ queryKey: ["admin-customers"], queryFn: adminCustomersApi.list });
  const list = customers ?? [];

  const verified = list.filter((c) => c.kycStatus === "verified").length;
  const pending = list.filter((c) => c.kycStatus === "pending" || c.kycStatus === "unverified").length;
  const suspended = list.filter((c) => c.status === "suspended").length;

  return (
    <AdminShell>
      <AdminPageHeading title="Customers" subtitle="Manage every user registered on EasyBills" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total customers" value={list.length.toString()} icon={Users} />
        <AdminStatCard label="KYC verified" value={verified.toString()} icon={UserCheck} />
        <AdminStatCard label="KYC pending" value={pending.toString()} icon={ShieldAlert} />
        <AdminStatCard label="Suspended" value={suspended.toString()} icon={UserX} />
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading customers...</p>
        ) : (
          <AdminDataTable
            columns={columns}
            data={list}
            searchKeys={["name", "email", "phone"]}
            searchPlaceholder="Search customers..."
          />
        )}
      </div>
    </AdminShell>
  );
}
