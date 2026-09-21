"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getKycApplications, ApiRequestError } from "@/lib/api";
import type { KycApplication } from "@/lib/types";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatDate, cx } from "@/lib/utils";

const STATUS_TABS = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "declined", label: "Declined" },
  { id: "all", label: "All" },
];

const TYPE_TABS = [
  { id: "all", label: "All types" },
  { id: "nin", label: "NIN" },
  { id: "bvn", label: "BVN" },
];

const STATUS_TONE: Record<string, string> = {
  pending: "bg-warn/15 text-warn",
  approved: "bg-good/15 text-good",
  declined: "bg-bad/15 text-bad",
};

export function ApplicationsPanel() {
  const [status, setStatus] = useState("pending");
  const [type, setType] = useState("all");
  const [applications, setApplications] = useState<KycApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(s: string, t: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await getKycApplications(s, t);
      setApplications(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load KYC applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(status, type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg bg-base p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setStatus(t.id)}
              className={cx(
                "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                status === t.id ? "bg-surface-hover text-ink" : "text-ink-faint hover:text-ink"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-lg border border-line bg-surface p-1">
          {TYPE_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={cx(
                "rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors",
                type === t.id ? "bg-brand-500/15 text-brand-600" : "text-ink-faint hover:text-ink"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface shadow-card">
        {loading && <LoadingState label="Loading applications…" />}
        {!loading && error && <ErrorState message={error} onRetry={() => load(status, type)} />}
        {!loading && !error && applications.length === 0 && (
          <div className="p-4">
            <EmptyState
              icon={ShieldCheck}
              title="Nothing here"
              description="KYC applications matching this filter will show up here."
            />
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-line-soft last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3">
                      <Link href={`/kyc/applications/${app.id}`} className="block">
                        <span className="font-medium text-ink">{app.customerName || "—"}</span>
                        <span className="block text-xs text-ink-faint">{app.customerEmail}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 uppercase text-ink-muted">{app.type}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(app.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cx(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                          STATUS_TONE[app.status]
                        )}
                      >
                        {app.status}
                      </span>
                      {app.status === "declined" && app.declineReason && (
                        <span
                          className="mt-1 block max-w-[220px] truncate text-[11px] text-ink-faint"
                          title={app.declineReason}
                        >
                          {app.declineReason}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
