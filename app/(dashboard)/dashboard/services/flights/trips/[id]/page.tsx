"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { FeatureGate } from "@/components/dashboard/feature-gate";
import { Badge, Card, ConfirmSheet, CopyButton, ErrorText, GhostButton, Label, Loading, statusTone } from "@/components/dashboard/ui-bits";
import { useApiData } from "@/hooks/use-api-data";
import { flightsApi } from "@/lib/api/extra-services";
import { friendlyError } from "@/lib/action-helpers";
import { FLAGS } from "@/lib/feature-flags";
import { formatDateTime } from "@/lib/format";
import { formatNaira } from "@/lib/utils";

export default function TripDetailPage() {
  return (
    <FeatureGate enabled={FLAGS.flights} title="Trip details" subtitle="Your booking">
      <Detail />
    </FeatureGate>
  );
}

function Detail() {
  const { id } = useParams<{ id: string }>();
  const trip = useApiData(() => flightsApi.booking(id), [id]);
  const [confirm, setConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refund, setRefund] = useState<number | null>(null);
  const polls = useRef(0);

  const b = trip.data;
  // E-tickets can be issued a little after booking: poll a few times while documents are empty.
  useEffect(() => {
    if (!b || b.status !== "confirmed" || (b.documents ?? []).length > 0) return;
    const t = setInterval(() => { if (polls.current++ < 6) trip.refresh(); }, 10_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b?.status, b?.documents?.length]);

  const cancel = async () => {
    setCancelling(true); setError(null);
    try { const r = await flightsApi.cancel(id); setRefund(r.refundAmount); setConfirm(false); trip.refresh(); }
    catch (e) { setError(friendlyError(e) + " If this keeps happening, please contact support."); setConfirm(false); }
    finally { setCancelling(false); }
  };

  return (
    <div className="space-y-6">
      <SubPageHeader title="Trip details" subtitle="Your booking" back="/dashboard/services/flights/trips" />
      {trip.loading ? <Loading />
        : trip.error || !b ? <ErrorText>{friendlyError(trip.error)}</ErrorText>
        : (
          <>
            <Card className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-display text-xl font-bold">{b.origin} → {b.destination}</p>
                <Badge tone={statusTone(b.status)}>{b.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm"><span className="text-[rgb(var(--fg-muted))]">Reference</span><span className="flex items-center gap-3 font-mono font-bold">{b.bookingReference}<CopyButton value={b.bookingReference} /></span></div>
              <div className="flex justify-between text-sm"><span className="text-[rgb(var(--fg-muted))]">Departs</span><span>{formatDateTime(b.departureAt)}</span></div>
              {b.returnAt && <div className="flex justify-between text-sm"><span className="text-[rgb(var(--fg-muted))]">Returns</span><span>{formatDateTime(b.returnAt)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-[rgb(var(--fg-muted))]">Paid</span><span className="font-bold">{formatNaira(b.amountPaid)}</span></div>
              {b.status === "cancelled" && b.refundAmount != null && <div className="flex justify-between text-sm"><span className="text-[rgb(var(--fg-muted))]">Refunded</span><span className="font-bold text-emerald-500">{formatNaira(b.refundAmount)}</span></div>}
            </Card>

            {refund !== null && (
              <p role="status" className="rounded-2xl bg-emerald-500/10 p-3 text-center text-sm text-emerald-500">
                Booking cancelled. {refund > 0 ? `${formatNaira(refund)} has been refunded to your wallet.` : "This fare was non-refundable, so no refund was issued."}
              </p>
            )}

            {(b.passengers ?? []).length > 0 && (
              <div className="space-y-2">
                <Label>Passengers</Label>
                {(b.passengers ?? []).map((p, i) => (
                  <Card key={i} className="text-sm font-semibold">{String(p.givenName ?? "")} {String(p.familyName ?? "")}</Card>
                ))}
              </div>
            )}

            {b.status === "confirmed" && (
              <div className="space-y-2">
                <Label>E-tickets</Label>
                {(b.documents ?? []).length === 0
                  ? <Card className="text-sm text-[rgb(var(--fg-muted))]">Your e-ticket is being issued. This page will update shortly. You&apos;ll also receive it by email.</Card>
                  : (b.documents ?? []).map((d, i) => (
                      <Card key={i} className="flex items-center justify-between text-sm">
                        <span className="font-mono font-bold">{d.uniqueIdentifier}</span><CopyButton value={d.uniqueIdentifier} />
                      </Card>
                    ))}
              </div>
            )}

            <ErrorText>{error}</ErrorText>
            {b.status === "confirmed" && <GhostButton onClick={() => setConfirm(true)} className="w-full border-red-500/40 text-red-500">Cancel booking</GhostButton>}
          </>
        )}
      <ConfirmSheet open={confirm} danger loading={cancelling} title="Cancel this booking?" confirmLabel="Cancel booking"
        message="The refund amount depends on the airline's fare rules and is only known after cancelling. Some fares are non-refundable."
        onConfirm={cancel} onCancel={() => setConfirm(false)} />
    </div>
  );
}
