"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/admin/status-pill";
import { adminTransactionsApi, AdminTransactionRow } from "@/lib/api/admin/transactions";
import { formatDate, formatNaira } from "@/lib/utils";

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"all" | "success" | "pending" | "failed">("all");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["admin-transactions", status],
    queryFn: () => adminTransactionsApi.list(status),
  });

  const columns: Column<AdminTransactionRow>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (t) => <span className="font-mono text-xs">{t.reference}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (t) => (
        <div className="flex flex-col">
          <span className="font-medium">{t.customerName}</span>
          <span className="text-xs text-ink-400 dark:text-paper-200/40">{t.customerEmail}</span>
        </div>
      ),
    },
    {
      key: "title",
      header: "Transaction",
      render: (t) => (
        <div className="flex flex-col">
          <span className="font-medium">{t.title}</span>
          <span className="text-xs capitalize text-ink-400 dark:text-paper-200/40">{t.category}</span>
        </div>
      ),
    },
    {
      key: "recipient",
      header: "Recipient",
      render: (t) => t.subtitle ?? t.recipient ?? "—",
    },
    {
      key: "amount",
      header: "Amount",
      render: (t) => (
        <div className="flex flex-col">
          <span>{formatNaira(t.amount)}</span>
          {!!t.fee && (
            <span className="text-xs text-ink-400 dark:text-paper-200/40">
              +{formatNaira(t.fee)} fee
            </span>
          )}
        </div>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      render: (t) => t.provider ?? "—",
    },
    {
      key: "balanceAfter",
      header: "Balance after",
      render: (t) => (t.balanceAfter !== null ? formatNaira(t.balanceAfter) : "—"),
    },
    {
      key: "status",
      header: "Status",
      render: (t) => (
        <div className="flex flex-col gap-0.5">
          <StatusPill status={t.status} />
          {t.status === "failed" && t.failureReason && (
            <span className="max-w-[220px] truncate text-xs text-red-500" title={t.failureReason}>
              {t.failureReason}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (t) => formatDate(t.date),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (t) => (
        <button
          onClick={() => router.push(`/admin/transactions/${t.id}`)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-paper-200/60 dark:hover:bg-ink-800"
        >
          <Eye className="h-3.5 w-3.5" />
          View more
        </button>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeading
        title="Transactions"
        subtitle="Every transaction processed on the platform"
      />

      <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="success">Success</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading transactions...</p>
        ) : (
          <AdminDataTable
            columns={columns}
            data={transactions ?? []}
            searchKeys={["customerName", "customerEmail", "reference", "title", "category"]}
            searchPlaceholder="Search by customer, reference, or transaction..."
          />
        )}
      </div>
    </AdminShell>
  );
}