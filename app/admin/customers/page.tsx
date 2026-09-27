"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Users, UserCheck, ShieldAlert, UserX, Eye } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { adminCustomersApi, AdminCustomerRow } from "@/lib/api/admin/customers";
import { formatDate, formatNaira } from "@/lib/utils";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const { data: customers, isLoading } = useQuery({ queryKey: ["admin-customers"], queryFn: adminCustomersApi.list });
  const list = customers ?? [];

  const verified = list.filter((c) => c.kycStatus === "verified").length;
  const pending = list.filter((c) => c.kycStatus === "pending" || c.kycStatus === "unverified").length;
  const suspended = list.filter((c) => c.status === "suspended").length;

  const columns: Column<AdminCustomerRow>[] = [
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
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <div className="flex flex-col gap-0.5">
          <StatusPill status={c.status} />
          {c.status === "suspended" && c.suspensionReason && (
            <span className="max-w-[180px] truncate text-xs text-red-500" title={c.suspensionReason}>
              {c.suspensionReason}
            </span>
          )}
        </div>
      ),
    },
    { key: "joinedAt", header: "Joined", render: (c) => formatDate(c.joinedAt) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c) => (
        <button
          onClick={() => router.push(`/admin/customers/${c.id}`)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-paper-200/60 dark:hover:bg-ink-800"
        >
          <Eye className="h-3.5 w-3.5" />
          View details
        </button>
      ),
    },
  ];

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