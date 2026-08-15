"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminCustomersApi } from "@/lib/api/admin/customers";
import { adminWithdrawalsApi } from "@/lib/api/admin/withdrawals";
import { AdminCustomer } from "@/lib/mock-data/admin";
import { formatDate, formatNaira } from "@/lib/utils";
import { Wallet, Clock, CheckCircle2, XCircle } from "lucide-react";

const columns: Column<AdminCustomer>[] = [
  { key: "name", header: "Customer", render: (c) => c.name },
  { key: "email", header: "Email", render: (c) => <span className="text-ink-500 dark:text-paper-200/40">{c.email}</span> },
  { key: "walletBalance", header: "Balance", render: (c) => <span className="font-semibold">{formatNaira(c.walletBalance)}</span> },
  { key: "tier", header: "Tier", render: (c) => c.tier },
];

export default function AdminWalletsPage() {
  const queryClient = useQueryClient();
  const { data: customers } = useQuery({ queryKey: ["admin-customers"], queryFn: adminCustomersApi.list });
  const { data: withdrawals } = useQuery({ queryKey: ["admin-withdrawals-pending"], queryFn: adminWithdrawalsApi.pending });

  const customerList = customers ?? [];
  const withdrawalList = withdrawals ?? [];
  const totalBalance = customerList.reduce((s, c) => s + c.walletBalance, 0);

  const handleDecision = async (id: string, approve: boolean) => {
    try {
      if (approve) {
        await adminWithdrawalsApi.approve(id);
      } else {
        await adminWithdrawalsApi.reject(id);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success(approve ? "Withdrawal approved" : "Withdrawal rejected — wallet refunded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not process this withdrawal.");
    }
  };

  return (
    <AdminShell>
      <AdminPageHeading title="Wallets" subtitle="Manage customer wallets and withdrawal requests" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminStatCard label="Total wallet balance" value={formatNaira(totalBalance, { compact: true })} icon={Wallet} />
        <AdminStatCard label="Pending withdrawals" value={withdrawalList.length.toString()} icon={Clock} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pending withdrawal approvals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          {withdrawalList.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-500 dark:text-paper-200/40">
              No pending withdrawals — you're all caught up.
            </p>
          ) : (
            withdrawalList.map((w) => (
              <div
                key={w.id}
                className="flex flex-col gap-3 rounded-2xl border border-ink-100 dark:border-ink-700 p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">{w.customer}</p>
                  <p className="text-xs text-ink-500 dark:text-paper-200/40">
                    {w.bank} &middot; {w.accountNumber} &middot; Requested {formatDate(w.requestedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-bold">{formatNaira(w.amount)}</span>
                  <Button size="sm" variant="outline" onClick={() => handleDecision(w.id, false)}>
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => handleDecision(w.id, true)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-ink-600 dark:text-paper-200/60">Customer wallets</h2>
        <AdminDataTable columns={columns} data={customerList} searchKeys={["name", "email"]} searchPlaceholder="Search customers..." />
      </div>
    </AdminShell>
  );
}
