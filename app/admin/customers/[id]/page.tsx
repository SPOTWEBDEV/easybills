"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ShieldOff, ShieldCheck, User, Wallet, Eye } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusPill } from "@/components/admin/status-pill";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { adminCustomersApi, CustomerRecentTransaction } from "@/lib/api/admin/customers";
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

export default function AdminCustomerDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customer", id],
    queryFn: () => adminCustomersApi.get(id),
  });

  const user = data?.user;
  const wallet = data?.wallet;
  const transactions = data?.recentTransactions ?? [];

  const handleSuspend = async () => {
    if (reason.trim().length < 3) {
      toast.error("Reason must be at least 3 characters — it's shown to the customer.");
      return;
    }
    setSubmitting(true);
    try {
      await adminCustomersApi.suspend(id, reason.trim());
      toast.success("Customer suspended");
      setShowSuspendForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-customer", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not suspend customer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReactivate = async () => {
    setSubmitting(true);
    try {
      await adminCustomersApi.reactivate(id);
      toast.success("Customer reactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-customer", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reactivate customer.");
    } finally {
      setSubmitting(false);
    }
  };

  const txnColumns: Column<CustomerRecentTransaction>[] = [
    { key: "reference", header: "Reference", render: (t) => <span className="font-mono text-xs">{t.reference}</span> },
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
      key: "amount",
      header: "Amount",
      render: (t) => (
        <div className="flex flex-col">
          <span>{formatNaira(t.amount)}</span>
          {!!t.fee && <span className="text-xs text-ink-400 dark:text-paper-200/40">+{formatNaira(t.fee)} fee</span>}
        </div>
      ),
    },
    { key: "status", header: "Status", render: (t) => <StatusPill status={t.status} /> },
    { key: "date", header: "Date", render: (t) => formatDate(t.date) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (t) => (
        <button
          onClick={() => router.push(`/admin/transactions/${t.id}`)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>
      ),
    },
  ];

  return (
    <AdminShell>
      <button
        onClick={() => router.push("/admin/customers")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-700 dark:text-paper-200/50 dark:hover:text-paper-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to customers
      </button>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading customer...</p>
      ) : !user || !wallet ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Customer not found.</p>
      ) : (
        <>
          <div className="mb-1 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{user.avatarInitials}</AvatarFallback>
            </Avatar>
            <AdminPageHeading title={user.fullName} subtitle={user.email} />
          </div>

          <Card className="mb-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <StatusPill status={user.status} />
              {user.status === "active" ? (
                !showSuspendForm && (
                  <Button variant="danger" onClick={() => setShowSuspendForm(true)}>
                    <ShieldOff className="mr-1.5 h-4 w-4" />
                    Suspend
                  </Button>
                )
              ) : (
                <Button onClick={handleReactivate} loading={submitting}>
                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                  Reactivate
                </Button>
              )}
            </div>

            {user.status === "suspended" && user.suspensionReason && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 dark:border-red-900/40 dark:bg-red-950/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Suspension reason</p>
                <p className="mt-0.5 text-sm text-red-700 dark:text-red-300">{user.suspensionReason}</p>
              </div>
            )}

            {showSuspendForm && (
              <div className="mt-4 space-y-3 rounded-xl border border-ink-200 p-4 dark:border-ink-700">
                <label className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-paper-200/40">
                  Reason (shown to the customer on their next login, 3–255 characters)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={255}
                  rows={3}
                  className="w-full rounded-lg border border-ink-200 bg-transparent p-2.5 text-sm dark:border-ink-700"
                  placeholder="e.g. Suspicious transaction activity flagged for review"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSuspendForm(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleSuspend} loading={submitting}>
                    Confirm suspend
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <User className="h-4 w-4 text-ink-400" />
                Profile
              </div>
              <DetailRow label="Phone" value={user.phone} />
              <DetailRow label="Tier" value={user.tier} />
              <DetailRow label="KYC status" value={<StatusPill status={user.kycStatus} />} />
              <DetailRow label="NIN verified" value={user.ninVerified ? "Yes" : "No"} />
              <DetailRow label="BVN verified" value={user.bvnVerified ? "Yes" : "No"} />
              <DetailRow label="Referral code" value={<span className="font-mono">{user.referralCode}</span>} />
              <DetailRow label="Transaction PIN set" value={user.hasTransactionPin ? "Yes" : "No"} />
              <DetailRow label="2FA enabled" value={user.twoFactorEnabled ? "Yes" : "No"} />
              <DetailRow label="Joined" value={formatDate(user.createdAt)} />
            </Card>

            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Wallet className="h-4 w-4 text-ink-400" />
                Wallet
              </div>
              <DetailRow label="Balance" value={formatNaira(wallet.balance)} />
              <DetailRow label="Cashback" value={formatNaira(wallet.cashback)} />
            </Card>
          </div>

          <Card className="mt-5 p-5">
            <h3 className="mb-3 text-sm font-semibold">Recent transactions</h3>
            {transactions.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-500 dark:text-paper-200/40">
                No transactions yet.
              </p>
            ) : (
              <AdminDataTable columns={txnColumns} data={transactions} pageSize={10} />
            )}
          </Card>
        </>
      )}
    </AdminShell>
  );
}