"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Compass, ExternalLink, Star } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { FeatureGate } from "@/components/dashboard/feature-gate";
import { Card, ErrorText, Label, Loading } from "@/components/dashboard/ui-bits";
import { useApiData } from "@/hooks/use-api-data";
import { toursApi } from "@/lib/api/extra-services";
import { friendlyError } from "@/lib/action-helpers";
import { FLAGS } from "@/lib/feature-flags";
import { formatDuration, formatMoney } from "@/lib/format";

export default function TourDetailPage() {
  return (
    <FeatureGate enabled={FLAGS.tours} title="Tour" subtitle="Tour details">
      <Detail />
    </FeatureGate>
  );
}

// inclusions / exclusions / additionalInfo come straight from Viator: render defensively, skip what we don't recognise.
function toLines(v: unknown): string[] {
  if (!v) return [];
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(toLines);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    for (const k of ["description", "otherDescription", "text", "title", "name"]) {
      if (typeof o[k] === "string" && o[k]) return [o[k] as string];
    }
  }
  return [];
}

function Section({ title, value }: { title: string; value: unknown }) {
  const lines = toLines(value);
  if (!lines.length) return null;
  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      <Card><ul className="list-disc space-y-1.5 pl-5 text-sm">{lines.map((l, i) => <li key={i}>{l}</li>)}</ul></Card>
    </div>
  );
}

function Detail() {
  const { code } = useParams<{ code: string }>();
  const tour = useApiData(() => toursApi.product(decodeURIComponent(code)), [code]);
  const [img, setImg] = useState(0);
  const t = tour.data;
  const images = t ? (t.images && t.images.length ? t.images : t.image ? [t.image] : []) : [];

  return (
    <div className="space-y-6">
      <SubPageHeader title="Tour details" subtitle="Book securely on Viator" back="/dashboard/services/tours" />
      {tour.loading ? <Loading />
        : tour.error || !t ? <ErrorText>{friendlyError(tour.error)}</ErrorText>
        : (
          <>
            {images.length > 0 ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[img]} alt="" className="h-56 w-full rounded-2xl object-cover sm:h-72" />
                {images.length > 1 && (
                  <div className="no-scrollbar flex gap-2 overflow-x-auto">
                    {images.slice(0, 8).map((u, i) => (
                      <button key={u} type="button" onClick={() => setImg(i)} aria-label={`Photo ${i + 1}`} className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${i === img ? "border-brand-500" : "border-transparent"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt="" loading="lazy" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : <div className="flex h-40 items-center justify-center rounded-2xl bg-teal-500/10"><Compass className="h-8 w-8 text-teal-500" /></div>}

            <div className="space-y-2">
              <h1 className="font-display text-xl font-bold leading-snug">{t.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[rgb(var(--fg-muted))]">
                {t.rating != null && <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{t.rating.toFixed(1)}{t.reviewCount != null && ` (${t.reviewCount} reviews)`}</span>}
                {t.durationMinutes ? <span>{formatDuration(t.durationMinutes)}</span> : null}
              </div>
              {t.description && <p className="whitespace-pre-line text-sm leading-relaxed">{t.description}</p>}
            </div>

            <Section title="What's included" value={t.inclusions} />
            <Section title="Not included" value={t.exclusions} />
            <Section title="Good to know" value={t.additionalInfo} />
            <Section title="Cancellation policy" value={t.cancellationPolicy} />

            {/* The sticky bar keeps the call to action in view. The URL is used exactly as returned (affiliate tracking). */}
            <div className="sticky bottom-20 z-10 flex items-center justify-between gap-4 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 shadow-lg lg:bottom-4">
              <div>
                <p className="text-xs text-[rgb(var(--fg-muted))]">From</p>
                <p className="font-display text-lg font-bold text-brand-500">{t.fromPrice != null ? formatMoney(t.fromPrice, t.currency ?? "USD") : "Price on Viator"}</p>
              </div>
              {t.bookingUrl && (
                <a href={t.bookingUrl} target="_blank" rel="noopener noreferrer sponsored"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-glow">
                  Book on Viator <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-center text-xs text-[rgb(var(--fg-muted))]">Payment is completed on viator.com. The price shown there is what you pay.</p>
          </>
        )}
    </div>
  );
}
