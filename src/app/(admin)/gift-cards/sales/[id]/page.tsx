"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Eye, ShieldAlert, X } from "lucide-react";
import {
  approveGiftCardSale,
  getGiftCardSaleDetail,
  rejectGiftCardSale,
  ApiRequestError,
} from "@/lib/api";
import type { GiftCardSaleDetail } from "@/lib/types";
import { LoadingState, ErrorState } from "@/components/states";
import { formatDate, formatNaira, cx } from "@/lib/utils";

const STATUS_TONE: Record<string, string> = {
  pending: "bg-warn/15 text-warn",
  approved: "bg-good/15 text-good",
  rejected: "bg-bad/15 text-bad",
};

export default function GiftCardSaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [sale, setSale] = useState<GiftCardSaleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getGiftCardSaleDetail(id);
      setSale(res);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load this submission.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleApprove() {
    setActionError(null);
    setActionLoading(true);
    try {
      await approveGiftCardSale(id);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Couldn't approve this submission.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    setActionError(null);
    setActionLoading(true);
    try {
      await rejectGiftCardSale(id, rejectReason.trim() || undefined);
      setShowRejectForm(false);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Couldn't reject this submission.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => router.push("/gift-cards")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Gift Cards
      </button>

      {loading && <LoadingState label="Loading submission…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && sale && (
        <>
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card sm:flex-row sm:items-center">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-ink">{sale.brandName}</h1>
                <span
                  className={cx(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                    STATUS_TONE[sale.status]
                  )}
                >
                  {sale.status}
                </span>
              </div>
              <p className="text-sm text-ink-faint">
                {sale.customerName} · {sale.customerEmail}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-faint">Payout if approved</p>
              <p className="font-display text-2xl font-bold text-ink">{formatNaira(sale.payoutAmount)}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-6">
              <p className="mb-1 text-xs text-ink-faint">Face value submitted</p>
              <p className="font-display text-xl font-bold text-ink">{formatNaira(sale.faceValueAmount)}</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-6">
              <p className="mb-1 text-xs text-ink-faint">Submitted</p>
              <p className="font-display text-xl font-bold text-ink">{formatDate(sale.createdAt)}</p>
            </div>
          </div>

          {sale.note && (
            <div className="mb-6 rounded-2xl border border-line bg-surface p-6">
              <p className="mb-1 text-xs text-ink-faint">Customer note</p>
              <p className="text-sm text-ink-muted">{sale.note}</p>
            </div>
          )}

          <div className="mb-6 rounded-2xl border border-line bg-surface p-6">
            <div className="mb-3 flex items-center gap-2 text-warn">
              <ShieldAlert className="h-4 w-4" />
              <p className="text-sm font-medium">
                Viewing this card's code and PIN is logged to the audit trail — who viewed it and
                when.
              </p>
            </div>

            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-surface-hover"
              >
                <Eye className="h-4 w-4" />
                Reveal code &amp; PIN
              </button>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs text-ink-faint">Card code</p>
                  <p className="rounded-lg border border-line bg-base px-3 py-2 font-mono text-sm text-ink">
                    {sale.cardCode}
                  </p>
                </div>
                {sale.cardPin && (
                  <div>
                    <p className="mb-1 text-xs text-ink-faint">Card PIN</p>
                    <p className="rounded-lg border border-line bg-base px-3 py-2 font-mono text-sm text-ink">
                      {sale.cardPin}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {sale.status === "pending" && (
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="mb-4 font-display text-base font-semibold text-ink">Review decision</h2>

              {actionError && (
                <div className="mb-4 rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-xs text-bad">
                  {actionError}
                </div>
              )}

              {!showRejectForm ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-good/15 px-5 py-2.5 text-sm font-semibold text-good transition-colors hover:bg-good/25 disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />
                    Approve &amp; credit wallet
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-bad/15 px-5 py-2.5 text-sm font-semibold text-bad transition-colors hover:bg-bad/25 disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              ) : (
                <div>
                  <label className="mb-3 block">
                    <span className="mb-1.5 block text-xs font-medium text-ink-muted">
                      Reason (shown to the customer)
                    </span>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Card already redeemed, or Invalid code"
                      className="w-full resize-none rounded-lg border border-line bg-base px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
                    />
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="rounded-full bg-bad/15 px-5 py-2.5 text-sm font-semibold text-bad hover:bg-bad/25 disabled:opacity-60"
                    >
                      {actionLoading ? "Rejecting…" : "Confirm reject"}
                    </button>
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {sale.status !== "pending" && sale.adminNote && (
            <div className="rounded-2xl border border-line bg-surface p-6">
              <p className="mb-1 text-xs text-ink-faint">Admin note</p>
              <p className="text-sm text-ink-muted">{sale.adminNote}</p>
              {sale.reviewedAt && (
                <p className="mt-2 text-xs text-ink-faint">Reviewed {formatDate(sale.reviewedAt)}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
