"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { getGiftCardSales, ApiRequestError } from "@/lib/api";
import type { GiftCardSale } from "@/lib/types";
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
  const [status, setStatus] = useState("pending");
  const [sales, setSales] = useState<GiftCardSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(s: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await getGiftCardSales(s);
      setSales(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load sell submissions.");
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
        {loading && <LoadingState label="Loading submissions…" />}
        {!loading && error && <ErrorState message={error} onRetry={() => load(status)} />}
        {!loading && !error && sales.length === 0 && (
          <div className="p-4">
            <EmptyState
              icon={Inbox}
              title="Nothing here"
              description="Sell submissions matching this filter will show up here for review."
            />
          </div>
        )}

        {!loading && !error && sales.length > 0 && (
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
                {sales.map((s) => (
                  <tr key={s.id} className="border-b border-line-soft last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3">
                      <Link href={`/gift-cards/sales/${s.id}`} className="block">
                        <span className="font-medium text-ink">{s.customerName || "—"}</span>
                        <span className="block text-xs text-ink-faint">{s.customerEmail}</span>
                      </Link>
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
