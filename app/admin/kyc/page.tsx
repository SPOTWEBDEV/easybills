"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, SlidersHorizontal } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/admin/status-pill";
import { adminKycApi, KYCApplicationRow, KYCApplicationStatus, KYCApplicationType } from "@/lib/api/admin/kyc";
import { formatDate } from "@/lib/utils";

export default function AdminKycPage() {
  const router = useRouter();
  const [status, setStatus] = useState<KYCApplicationStatus | "all">("pending");
  const [type, setType] = useState<KYCApplicationType | "all">("all");

  const { data: applications, isLoading } = useQuery({
    queryKey: ["admin-kyc-applications", status, type],
    queryFn: () => adminKycApi.listApplications({ status, type }),
  });

  const columns: Column<KYCApplicationRow>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-medium">{a.customerName}</span>
          <span className="text-xs text-ink-400 dark:text-paper-200/40">{a.customerEmail}</span>
        </div>
      ),
    },
    { key: "phone", header: "Phone", render: (a) => a.customerPhone },
    {
      key: "type",
      header: "Type",
      render: (a) => <span className="uppercase">{a.type}</span>,
    },
    { key: "dateOfBirth", header: "Date of birth", render: (a) => formatDate(a.dateOfBirth) },
    {
      key: "status",
      header: "Status",
      render: (a) => (
        <div className="flex flex-col gap-0.5">
          <StatusPill status={a.status} />
          {a.status === "declined" && a.declineReason && (
            <span className="max-w-[200px] truncate text-xs text-red-500" title={a.declineReason}>
              {a.declineReason}
            </span>
          )}
        </div>
      ),
    },
    { key: "createdAt", header: "Submitted", render: (a) => formatDate(a.createdAt) },
    {
      key: "reviewedAt",
      header: "Reviewed",
      render: (a) => (a.reviewedAt ? formatDate(a.reviewedAt) : "—"),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (a) => (
        <button
          onClick={() => router.push(`/admin/kyc/${a.id}`)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-paper-200/60 dark:hover:bg-ink-800"
        >
          <Eye className="h-3.5 w-3.5" />
          Review
        </button>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeading
        title="KYC"
        subtitle="Review NIN/BVN verification submissions — tier upgrades apply only on approval"
        action={
          <Link
            href="/admin/kyc/tier-limits"
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-paper-200/60 dark:hover:bg-ink-800"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Tier limits
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="declined">Declined</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={type} onValueChange={(v) => setType(v as typeof type)}>
          <TabsList>
            <TabsTrigger value="all">All types</TabsTrigger>
            <TabsTrigger value="nin">NIN</TabsTrigger>
            <TabsTrigger value="bvn">BVN</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading applications...</p>
      ) : (
        <AdminDataTable
          columns={columns}
          data={applications ?? []}
          searchKeys={["customerName", "customerEmail", "customerPhone"]}
          searchPlaceholder="Search by customer name, email, or phone..."
        />
      )}
    </AdminShell>
  );
}