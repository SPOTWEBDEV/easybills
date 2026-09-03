"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Ban, CheckCircle2, Receipt, Wallet } from "lucide-react";
import { getCustomer, suspendCustomer, reactivateCustomer, ApiRequestError } from "@/lib/api";
import type { CustomerDetail } from "@/lib/types";
import { KycBadge, AccountStatusBadge, TransactionStatusBadge } from "@/components/status-badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatDate, formatNaira } from "@/lib/utils";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomer(id);
      setDetail(res);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load this customer.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleToggleStatus() {
    if (!detail) return;
    setActionLoading(true);
    try {
      if (detail.user.status === "active") {
        await suspendCustomer(id);
      } else {
        await reactivateCustomer(id);
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't update this customer.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => router.push("/customers")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to customers
      </button>

      {loading && <LoadingState label="Loading customer…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && detail && (
        <>
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-lg font-semibold text-brand-400">
                {detail.user.avatarInitials}
              </span>
              <div>
                <h1 className="font-display text-xl font-bold text-ink">{detail.user.fullName}</h1>
                <p className="text-sm text-ink-faint">{detail.user.email} · {detail.user.phone}</p>
                <div className="mt-2 flex items-center gap-2">
                  <KycBadge status={detail.user.kycStatus} />
                  <AccountStatusBadge status={detail.user.status} />
                  <span className="text-xs text-ink-faint">{detail.user.tier}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleStatus}
              disabled={actionLoading}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                detail.user.status === "active"
                  ? "bg-bad/15 text-bad hover:bg-bad/25"
                  : "bg-good/15 text-good hover:bg-good/25"
              }`}
            >
              {detail.user.status === "active" ? (
                <>
                  <Ban className="h-4 w-4" /> Suspend account
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Reactivate account
                </>
              )}
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <div className="mb-3 flex items-center gap-2 text-ink-faint">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">Wallet balance</span>
              </div>
              <p className="font-display text-2xl font-bold text-ink">{formatNaira(detail.wallet.balance)}</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <div className="mb-3 flex items-center gap-2 text-ink-faint">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">Cashback</span>
              </div>
              <p className="font-display text-2xl font-bold text-ink">{formatNaira(detail.wallet.cashback)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface shadow-card">
            <div className="border-b border-line p-4">
              <h2 className="font-display text-base font-semibold text-ink">Recent transactions</h2>
            </div>
            {detail.recentTransactions.length === 0 ? (
              <div className="p-4">
                <EmptyState icon={Receipt} title="No transactions yet" description="This customer hasn't made a purchase yet." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Service</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.recentTransactions.map((t) => (
                      <tr key={t.id} className="border-b border-line-soft last:border-0 hover:bg-surface-hover">
                        <td className="px-4 py-3 font-mono text-xs text-ink-muted">{t.reference}</td>
                        <td className="px-4 py-3 text-ink">{t.title}</td>
                        <td className="px-4 py-3 text-ink-muted">{formatNaira(t.amount)}</td>
                        <td className="px-4 py-3">
                          <TransactionStatusBadge status={t.status} />
                        </td>
                        <td className="px-4 py-3 text-ink-muted">{formatDate(t.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
