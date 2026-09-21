"use client";

import { useEffect, useState } from "react";
import { Inbox, Info } from "lucide-react";
import { getGiftCardSellTrades, ApiRequestError } from "@/lib/api";
import type { GiftCardSellTrade } from "@/lib/types";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatDate, formatNaira, cx } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const STATUS_TONE: Record<string, string> = {
  pending: "bg-warn/15 text-warn",
  approved: "bg-good/15 text-good",
  rejected: "bg-bad/15 text-bad",
};

export function SalesPanel() {
  const [status, setStatus] = useState("all");
  const [trades, setTrades] = useState<GiftCardSellTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(s: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await getGiftCardSellTrades(s);
      setTrades(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load sell trades.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div>
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-line bg-base px-3 py-2.5 text-xs text-ink-faint">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Sell trades are verified and paid out automatically by Sogo Africa via webhook — there's
        nothing to approve or reject here. This list is oversight only.
      </div>

      <div className="mb-4 inline-flex rounded-lg bg-base p-1">
        {TABS.map((t) => (
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

      <div className="rounded-2xl border border-line bg-surface shadow-card">
        {loading && <LoadingState label="Loading trades…" />}
        {!loading && error && <ErrorState message={error} onRetry={() => load(status)} />}
        {!loading && !error && trades.length === 0 && (
          <div className="p-4">
            <EmptyState
              icon={Inbox}
              title="Nothing here"
              description="Sell trades matching this filter will show up here."
            />
          </div>
        )}

        {!loading && !error && trades.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium">Face value</th>
                  <th className="px-4 py-3 font-medium">Payout</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((s) => (
                  <tr key={s.id} className="border-b border-line-soft last:border-0">
                    <td className="px-4 py-3">
                      <span className="block font-medium text-ink">{s.customerName || "—"}</span>
                      <span className="block text-xs text-ink-faint">{s.customerEmail}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{s.brandName}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatNaira(s.faceValueAmount)}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatNaira(s.payoutAmount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cx(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                          STATUS_TONE[s.status]
                        )}
                      >
                        {s.status}
                      </span>
                      {s.status === "rejected" && s.adminNote && (
                        <span className="mt-1 block max-w-[200px] truncate text-[11px] text-ink-faint" title={s.adminNote}>
                          {s.adminNote}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(s.createdAt)}</td>
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
