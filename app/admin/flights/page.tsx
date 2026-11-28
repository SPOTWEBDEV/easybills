"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Plane, Undo2, Wallet } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminFlightsApi, type AdminFlightBooking } from "@/lib/api/admin/flights";
import { fmtDateTime } from "@/lib/admin-format";
import { formatNaira } from "@/lib/utils";

type StatusTab = "all" | "confirmed" | "cancelled" | "failed";

const columns: Column<AdminFlightBooking>[] = [
  { key: "bookingReference", header: "Reference", render: (b) => <span className="font-mono text-xs font-semibold">{b.bookingReference}</span> },
  {
    key: "customerName", header: "Customer",
    render: (b) => (<div className="flex flex-col"><span className="font-medium">{b.customerName}</span><span className="text-xs text-ink-400 dark:text-paper-200/40">{b.customerEmail}</span></div>),
  },
  { key: "origin", header: "Route", render: (b) => <span className="font-semibold">{b.origin} → {b.destination}</span> },
  {
    key: "departureAt", header: "Departs",
    render: (b) => (<div className="flex flex-col"><span>{fmtDateTime(b.departureAt)}</span>{b.returnAt && <span className="text-xs text-ink-400 dark:text-paper-200/40">Returns {fmtDateTime(b.returnAt)}</span>}</div>),
  },
  { key: "passengerCount", header: "Pax", render: (b) => b.passengerCount },
  { key: "amountPaid", header: "Paid", render: (b) => formatNaira(b.amountPaid) },
  { key: "status", header: "Status", render: (b) => <StatusPill status={b.status} /> },
  { key: "refundAmount", header: "Refund", render: (b) => (b.status === "cancelled" ? formatNaira(b.refundAmount ?? 0) : "—") },
  { key: "createdAt", header: "Booked", render: (b) => fmtDateTime(b.createdAt) },
];

export default function AdminFlightsPage() {
  const [status, setStatus] = useState<StatusTab>("confirmed");
  const { data, isLoading } = useQuery({ queryKey: ["admin-flights", status], queryFn: () => adminFlightsApi.list(status) });
  const list = data ?? [];

  const confirmed = list.filter((b) => b.status === "confirmed");
  const refunded = list.reduce((s, b) => s + (b.status === "cancelled" ? b.refundAmount ?? 0 : 0), 0);
  const paid = confirmed.reduce((s, b) => s + b.amountPaid, 0);

  return (
    <AdminShell>
      <AdminPageHeading title="Flights" subtitle="Flight bookings made through EasyBills" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Bookings shown" value={String(list.length)} icon={Plane} />
        <AdminStatCard label="Confirmed" value={String(confirmed.length)} icon={CheckCircle2} />
        <AdminStatCard label="Paid (confirmed)" value={formatNaira(paid, { compact: true })} icon={Wallet} />
        <AdminStatCard label="Refunded" value={formatNaira(refunded, { compact: true })} icon={Undo2} />
      </div>

      <div className="mt-6">
        <Tabs value={status} onValueChange={(v) => setStatus(v as StatusTab)}>
          <TabsList>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading bookings...</p>
        ) : (
          <AdminDataTable columns={columns} data={list} searchKeys={["bookingReference", "customerName", "customerEmail", "origin", "destination"]} searchPlaceholder="Search by reference, customer or airport..." />
        )}
      </div>
    </AdminShell>
  );
}
