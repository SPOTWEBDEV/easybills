"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Eye, Fingerprint, ShieldAlert, X } from "lucide-react";
import {
  approveKycApplication,
  declineKycApplication,
  getKycApplicationDetail,
  ApiRequestError,
} from "@/lib/api";
import type { KycApplicationDetail } from "@/lib/types";
import { LoadingState, ErrorState } from "@/components/states";
import { formatDate, cx } from "@/lib/utils";

const STATUS_TONE: Record<string, string> = {
  pending: "bg-warn/15 text-warn",
  approved: "bg-good/15 text-good",
  declined: "bg-bad/15 text-bad",
};

export default function KycApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [app, setApp] = useState<KycApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [approvedTier, setApprovedTier] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getKycApplicationDetail(id);
      setApp(res);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load this application.");
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
      const res = await approveKycApplication(id);
      setApprovedTier(res.tier);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Couldn't approve this application.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDecline() {
    setActionError(null);
    const reason = declineReason.trim();
    if (reason.length < 3 || reason.length > 255) {
      setActionError("Reason must be 3–255 characters.");
      return;
    }
    setActionLoading(true);
    try {
      await declineKycApplication(id, reason);
      setShowDeclineForm(false);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Couldn't decline this application.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => router.push("/kyc")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to KYC
      </button>

      {loading && <LoadingState label="Loading application…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && app && (
        <>
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card sm:flex-row sm:items-center">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <h1 className="font-display text-xl font-bold uppercase text-ink">{app.type}</h1>
                <span
                  className={cx(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                    STATUS_TONE[app.status]
                  )}
                >
                  {app.status}
                </span>
              </div>
              <p className="text-sm text-ink-faint">
                {app.accountHolder.fullName} · {app.accountHolder.email} · {app.accountHolder.phone}
              </p>
            </div>
            {app.dateOfBirth && (
              <div className="text-right">
                <p className="text-xs text-ink-faint">Date of birth submitted</p>
                <p className="font-display text-lg font-bold text-ink">{app.dateOfBirth}</p>
              </div>
            )}
          </div>

          <div className="mb-6 rounded-2xl border border-line bg-surface p-6">
            <div className="mb-1.5 flex items-center gap-2 text-ink-faint">
              <Fingerprint className="h-4 w-4" />
              <p className="text-sm">Cross-check the name on the ID against the account holder above.</p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-line bg-surface p-6">
            <div className="mb-3 flex items-center gap-2 text-warn">
              <ShieldAlert className="h-4 w-4" />
              <p className="text-sm font-medium">
                Viewing this {app.type.toUpperCase()} number is logged to the audit trail — who
                viewed it and when.
              </p>
            </div>

            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-surface-hover"
              >
                <Eye className="h-4 w-4" />
                Reveal {app.type.toUpperCase()}
              </button>
            ) : (
              <div>
                <p className="mb-1 text-xs text-ink-faint">{app.type.toUpperCase()} number</p>
                <p className="rounded-lg border border-line bg-base px-3 py-2 font-mono text-sm text-ink">
                  {app.idNumber}
                </p>
              </div>
            )}
          </div>

          {app.bureauSnapshot && (
            <div className="mb-6 rounded-2xl border border-line bg-surface p-6">
              <p className="mb-3 text-sm font-medium text-ink">
                Bureau reference <span className="font-normal text-ink-faint">(best-effort only — not a verdict)</span>
              </p>
              <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {Object.entries(app.bureauSnapshot).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-3 rounded-lg bg-base px-3 py-2">
                    <dt className="capitalize text-ink-faint">{key.replace(/_/g, " ")}</dt>
                    <dd className="text-right text-ink">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {app.status === "pending" && (
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="mb-4 font-display text-base font-semibold text-ink">Review decision</h2>

              {actionError && (
                <div className="mb-4 rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-xs text-bad">
                  {actionError}
                </div>
              )}
              {approvedTier && (
                <div className="mb-4 rounded-lg border border-good/30 bg-good/10 px-3 py-2 text-xs text-good">
                  Approved — account moved to {approvedTier}.
                </div>
              )}

              {!showDeclineForm ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-good/15 px-5 py-2.5 text-sm font-semibold text-good transition-colors hover:bg-good/25 disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => setShowDeclineForm(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-bad/15 px-5 py-2.5 text-sm font-semibold text-bad transition-colors hover:bg-bad/25 disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </button>
                </div>
              ) : (
                <div>
                  <label className="mb-3 block">
                    <span className="mb-1.5 block text-xs font-medium text-ink-muted">
                      Reason (shown verbatim to the customer — write it plainly, e.g. "The name on
                      your NIN doesn't match your account name")
                    </span>
                    <textarea
                      rows={3}
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="Reason for declining"
                      className="w-full resize-none rounded-lg border border-line bg-base px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
                    />
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDecline}
                      disabled={actionLoading}
                      className="rounded-full bg-bad/15 px-5 py-2.5 text-sm font-semibold text-bad hover:bg-bad/25 disabled:opacity-60"
                    >
                      {actionLoading ? "Declining…" : "Confirm decline"}
                    </button>
                    <button
                      onClick={() => setShowDeclineForm(false)}
                      className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {app.status === "declined" && app.declineReason && (
            <div className="rounded-2xl border border-line bg-surface p-6">
              <p className="mb-1 text-xs text-ink-faint">Decline reason</p>
              <p className="text-sm text-ink-muted">{app.declineReason}</p>
              {app.reviewedAt && (
                <p className="mt-2 text-xs text-ink-faint">Reviewed {formatDate(app.reviewedAt)}</p>
              )}
            </div>
          )}

          {app.status === "approved" && app.reviewedAt && (
            <div className="rounded-2xl border border-line bg-surface p-6">
              <p className="text-xs text-ink-faint">Reviewed {formatDate(app.reviewedAt)}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
