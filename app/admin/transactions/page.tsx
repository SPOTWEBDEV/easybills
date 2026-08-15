"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/admin/status-pill";
import { adminTransactionsApi, AdminTransactionRow } from "@/lib/api/admin/transactions";
import { formatDate, formatNaira } from "@/lib/utils";

const columns: Column<AdminTransactionRow>[] = [
  { key: "reference", header: "Reference", render: (o) => <span className="font-mono text-xs">{o.reference}</span> },
  { key: "customer", header: "Customer", render: (o) => o.customer },
  { key: "service", header: "Service", render: (o) => o.service },
  { key: "amount", header: "Amount", render: (o) => formatNaira(o.amount) },
  { key: "status", header: "Status", render: (o) => <StatusPill status={o.status} /> },
  { key: "date", header: "Date", render: (o) => formatDate(o.date) },
];

export default function AdminTransactionsPage() {
  const [status, setStatus] = useState<"all" | "success" | "pending" | "failed">("all");
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["admin-transactions", status],
    queryFn: () => adminTransactionsApi.list(status),
  });

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
            searchKeys={["customer", "reference", "service"]}
            searchPlaceholder="Search by customer, reference, or service..."
          />
        )}
      </div>
    </AdminShell>
  );
}
