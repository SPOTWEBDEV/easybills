"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/admin/status-pill";
import { adminGiftCardsApi, GiftCardSellTrade } from "@/lib/api/admin/giftcards";
import { formatDate, formatNaira } from "@/lib/utils";

export default function AdminGiftCardSellTradesPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"all" | "pending" | "success" | "failed">("pending");

  const { data: trades, isLoading } = useQuery({
    queryKey: ["admin-giftcard-sell-trades", status],
    queryFn: () => adminGiftCardsApi.listSellTrades(status === "all" ? undefined : status),
  });

  const columns: Column<GiftCardSellTrade>[] = [
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
    { key: "brandName", header: "Brand", render: (t) => t.brandName },
    { key: "denominationAmount", header: "Denomination", render: (t) => formatNaira(t.denominationAmount) },
    { key: "payoutAmount", header: "Payout", render: (t) => formatNaira(t.payoutAmount) },
    { key: "status", header: "Status", render: (t) => <StatusPill status={t.status} /> },
    { key: "createdAt", header: "Date", render: (t) => formatDate(t.createdAt) },
  ];

  return (
    <AdminShell>
      <button
        onClick={() => router.push("/admin/gift-cards")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-700 dark:text-paper-200/50 dark:hover:text-paper-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to gift cards
      </button>

      <AdminPageHeading
        title="Gift Card Sell Trades"
        subtitle="Oversight only — Sogo Africa verifies and pays out automatically, nothing to action here"
      />

      <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="success">Success</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading trades...</p>
        ) : (
          <AdminDataTable
            columns={columns}
            data={trades ?? []}
            searchKeys={["customerName", "customerEmail", "brandName"]}
            searchPlaceholder="Search by customer or brand..."
          />
        )}
      </div>
    </AdminShell>
  );
}