"use client";
import Link from "next/link";
import { Plane } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { FeatureGate } from "@/components/dashboard/feature-gate";
import { Badge, Box, ErrorText, Loading, statusTone } from "@/components/dashboard/ui-bits";
import { useApiData } from "@/hooks/use-api-data";
import { flightsApi } from "@/lib/api/extra-services";
import { friendlyError } from "@/lib/action-helpers";
import { FLAGS } from "@/lib/feature-flags";
import { formatDateTime } from "@/lib/format";
import { formatNaira } from "@/lib/utils";

export default function TripsPage() {
  return (
    <FeatureGate enabled={FLAGS.flights} title="My trips" subtitle="Your flight bookings">
      <Trips />
    </FeatureGate>
  );
}

function Trips() {
  const trips = useApiData(() => flightsApi.bookings());
  return (
    <div className="space-y-6">
      <SubPageHeader title="My trips" subtitle="Your flight bookings" back="/dashboard/services/flights" />
      {trips.loading ? <Loading />
        : trips.error ? <ErrorText>{friendlyError(trips.error)}</ErrorText>
        : (trips.data ?? []).length === 0 ? <Box>No trips yet</Box>
        : (
          <div className="space-y-3">
            {(trips.data ?? []).map((b) => (
              <Link key={b.id} href={`/dashboard/services/flights/trips/${b.id}`} className="flex items-center gap-4 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 transition-colors hover:border-brand-500/50">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/15"><Plane className="h-5 w-5 text-blue-500" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{b.origin} → {b.destination}</p>
                  <p className="text-xs text-[rgb(var(--fg-muted))]">{formatDateTime(b.departureAt)} · {b.passengerCount} passenger{b.passengerCount > 1 ? "s" : ""}</p>
                  <p className="text-xs text-[rgb(var(--fg-muted))]">Ref {b.bookingReference} · {formatNaira(b.amountPaid)}</p>
                </div>
                <Badge tone={statusTone(b.status)}>{b.status}</Badge>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
}
