"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, AlertTriangle, User, Tag, Wallet, Calendar } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/admin/status-pill";
import { adminTransactionsApi } from "@/lib/api/admin/transactions";
import { formatDate, formatNaira } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-3 last:border-0 dark:border-ink-800">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-paper-200/40">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function AdminTransactionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  // No dedicated GET /admin/transactions/{id} endpoint is documented, so we
  // pull the full list and find the matching row. Swap this for a direct
  // fetch-by-id call if/when the backend exposes one.
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["admin-transactions", "all"],
    queryFn: () => adminTransactionsApi.list(),
  });

  const txn = transactions?.find((t) => t.id === id);

  return (
    <AdminShell>
      <button
        onClick={() => router.push("/admin/transactions")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-700 dark:text-paper-200/50 dark:hover:text-paper-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to transactions
      </button>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading transaction...</p>
      ) : !txn ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Transaction not found.</p>
      ) : (
        <>
          <AdminPageHeading title={txn.title} subtitle={`Reference ${txn.reference}`} />

          {/* Hero: the handful of things an admin looks for first */}
          <Card className="mb-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-paper-200/40">
                  Amount
                </p>
                <p className="mt-1 font-display text-3xl font-bold">{formatNaira(txn.amount)}</p>
                {!!txn.fee && (
                  <p className="mt-0.5 text-sm text-ink-500 dark:text-paper-200/40">
                    +{formatNaira(txn.fee)} fee charged
                  </p>
                )}
              </div>
              <StatusPill status={txn.status} />
            </div>

            {txn.status === "failed" && txn.failureReason && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 dark:border-red-900/40 dark:bg-red-950/30">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Failure reason</p>
                  <p className="mt-0.5 text-sm text-red-700 dark:text-red-300">{txn.failureReason}</p>
                </div>
              </div>
            )}
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <User className="h-4 w-4 text-ink-400" />
                Customer
              </div>
              <DetailRow label="Name" value={txn.customerName} />
              <DetailRow label="Email" value={txn.customerEmail} />
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Tag className="h-4 w-4 text-ink-400" />
                Transaction
              </div>
              <DetailRow label="Category" value={<span className="capitalize">{txn.category}</span>} />
              <DetailRow label="Provider" value={txn.provider ?? "—"} />
              <DetailRow label="Recipient" value={txn.subtitle ?? txn.recipient ?? "—"} />
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Wallet className="h-4 w-4 text-ink-400" />
                Wallet
              </div>
              <DetailRow
                label="Balance after"
                value={txn.balanceAfter !== null ? formatNaira(txn.balanceAfter) : "—"}
              />
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4 text-ink-400" />
                Record
              </div>
              <DetailRow label="Transaction ID" value={`#${txn.id}`} />
              <DetailRow
                label="Reference"
                value={
                  <button
                    onClick={() => navigator.clipboard.writeText(txn.reference)}
                    className="inline-flex items-center gap-1 font-mono text-xs hover:text-brand-600"
                    title="Copy reference"
                  >
                    {txn.reference}
                    <Copy className="h-3 w-3" />
                  </button>
                }
              />
              <DetailRow label="Date" value={formatDate(txn.date)} />
            </Card>
          </div>
        </>
      )}
    </AdminShell>
  );
}