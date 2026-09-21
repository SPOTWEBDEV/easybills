"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Ban, CheckCircle2, Fingerprint, Receipt, Wallet } from "lucide-react";
import { getCustomer, suspendCustomer, reactivateCustomer, ApiRequestError } from "@/lib/api";
import type { CustomerDetail } from "@/lib/types";
import { KycBadge, AccountStatusBadge, TransactionStatusBadge } from "@/components/status-badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatDate, formatNaira, getInitials, cx } from "@/lib/utils";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendError, setSuspendError] = useState<string | null>(null);

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

  async function handleSuspend(e: FormEvent) {
    e.preventDefault();
    setSuspendError(null);
    const reason = suspendReason.trim();
    if (reason.length < 3 || reason.length > 255) {
      setSuspendError("Reason must be 3–255 characters.");
      return;
    }
    setActionLoading(true);
    try {
      await suspendCustomer(id, reason);
      setShowSuspendForm(false);
      setSuspendReason("");
      await load();
    } catch (err) {
      setSuspendError(err instanceof ApiRequestError ? err.message : "Couldn't suspend this customer.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReactivate() {
    setActionLoading(true);
    try {
      await reactivateCustomer(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't reactivate this customer.");
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
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-lg font-semibold text-brand-600">
                {getInitials(detail.user.name)}
              </span>
              <div>
                <h1 className="font-display text-xl font-bold text-ink">{detail.user.name}</h1>
                <p className="text-sm text-ink-faint">{detail.user.email} · {detail.user.phone}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <KycBadge status={detail.user.kycStatus} />
                  <AccountStatusBadge status={detail.user.status} />
                  <span className="text-xs text-ink-faint">{detail.user.tier}</span>
                  <span
                    className={cx(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      detail.user.ninVerified ? "bg-good/15 text-good" : "bg-surface-hover text-ink-faint"
                    )}
                  >
                    <Fingerprint className="h-3 w-3" /> NIN {detail.user.ninVerified ? "verified" : "unverified"}
                  </span>
                  <span
                    className={cx(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      detail.user.bvnVerified ? "bg-good/15 text-good" : "bg-surface-hover text-ink-faint"
                    )}
                  >
                    <Fingerprint className="h-3 w-3" /> BVN {detail.user.bvnVerified ? "verified" : "unverified"}
                  </span>
                </div>
                {detail.user.status === "suspended" && detail.user.suspensionReason && (
                  <p className="mt-2 text-xs text-bad">Suspended: {detail.user.suspensionReason}</p>
                )}
              </div>
            </div>

            {detail.user.status === "active" ? (
              <button
                onClick={() => setShowSuspendForm((s) => !s)}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-full bg-bad/15 px-4 py-2 text-sm font-semibold text-bad transition-colors hover:bg-bad/25 disabled:opacity-60"
              >
                <Ban className="h-4 w-4" /> Suspend account
              </button>
            ) : (
              <button
                onClick={handleReactivate}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-full bg-good/15 px-4 py-2 text-sm font-semibold text-good transition-colors hover:bg-good/25 disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" /> Reactivate account
              </button>
            )}
          </div>

          {showSuspendForm && (
            <form
              onSubmit={handleSuspend}
              className="mb-6 rounded-2xl border border-bad/30 bg-bad/5 p-6"
            >
              <label className="mb-3 block">
                <span className="mb-1.5 block text-xs font-medium text-ink-muted">
                  Reason for suspension (shown to the customer, 3–255 characters)
                </span>
                <textarea
                  rows={2}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Suspected fraudulent referral activity"
                  className="w-full resize-none rounded-lg border border-line bg-base px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-bad focus:outline-none"
                />
              </label>
              {suspendError && <p className="mb-3 text-xs text-bad">{suspendError}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-full bg-bad px-5 py-2 text-sm font-semibold text-paper-50 hover:bg-bad/90 disabled:opacity-60"
                >
                  {actionLoading ? "Suspending…" : "Confirm suspend"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuspendForm(false)}
                  className="rounded-full border border-line px-5 py-2 text-sm font-medium text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

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
                          {t.status === "failed" && t.failureReason && (
                            <span className="mt-1 block max-w-[220px] truncate text-[11px] text-ink-faint" title={t.failureReason}>
                              {t.failureReason}
                            </span>
                          )}
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
