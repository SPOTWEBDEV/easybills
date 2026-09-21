"use client";

import { useEffect, useState } from "react";
import { Plane } from "lucide-react";
import { getAdminFlightBookings, ApiRequestError } from "@/lib/api";
import type { AdminFlightBooking } from "@/lib/types";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatDate, formatNaira, cx } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All" },
  { id: "confirmed", label: "Confirmed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "failed", label: "Failed" },
];

const STATUS_TONE: Record<string, string> = {
  confirmed: "bg-good/15 text-good",
  cancelled: "bg-ink-faint/15 text-ink-faint",
  failed: "bg-bad/15 text-bad",
};

export function BookingsPanel() {
  const [status, setStatus] = useState("all");
  const [bookings, setBookings] = useState<AdminFlightBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(s: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminFlightBookings(s);
      setBookings(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load flight bookings.");
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
        {loading && <LoadingState label="Loading bookings…" />}
        {!loading && error && <ErrorState message={error} onRetry={() => load(status)} />}
        {!loading && !error && bookings.length === 0 && (
          <div className="p-4">
            <EmptyState
              icon={Plane}
              title="No bookings found"
              description="Flight bookings matching this filter will show up here."
            />
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Route</th>
                  <th className="px-4 py-3 font-medium">Departs</th>
                  <th className="px-4 py-3 font-medium">Paid</th>
                  <th className="px-4 py-3 font-medium">Refund</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-line-soft last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3">
                      <span className="block font-medium text-ink">{b.customerName || "—"}</span>
                      <span className="block text-xs text-ink-faint">{b.customerEmail}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{b.bookingReference}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      {b.origin} → {b.destination}
                      {b.passengerCount > 1 && (
                        <span className="ml-1.5 text-xs text-ink-faint">×{b.passengerCount}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(b.departureAt)}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatNaira(b.amountPaid)}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      {b.refundAmount !== null ? formatNaira(b.refundAmount) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cx(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                          STATUS_TONE[b.status]
                        )}
                      >
                        {b.status}
                      </span>
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
