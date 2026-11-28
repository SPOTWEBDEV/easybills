"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Compass, MapPin, Search, Star } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { FormField } from "@/components/dashboard/form-field";
import { FeatureGate } from "@/components/dashboard/feature-gate";
import { Box, ErrorText, Loading, PillSelect, PrimaryButton } from "@/components/dashboard/ui-bits";
import { toursApi, type Destination, type TourSummary } from "@/lib/api/extra-services";
import { friendlyError } from "@/lib/action-helpers";
import { FLAGS } from "@/lib/feature-flags";
import { formatDuration, formatMoney } from "@/lib/format";

const SORTS = [
  { value: "default", label: "Recommended" }, { value: "rating", label: "Top rated" },
  { value: "price_low", label: "Price: low to high" }, { value: "price_high", label: "Price: high to low" },
];
const COUNT = 20;

type Query = { destinationId?: string; q?: string; sort: string };

export default function ToursPage() {
  return (
    <FeatureGate enabled={FLAGS.tours} title="Tours" subtitle="Tours and activities worldwide">
      <Tours />
    </FeatureGate>
  );
}

function Tours() {
  const [text, setText] = useState("");
  const [dest, setDest] = useState<Destination | null>(null);
  const [suggestions, setSuggestions] = useState<Destination[]>([]);
  const [query, setQuery] = useState<Query | null>(null);
  const [items, setItems] = useState<TourSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  // Destination autocomplete, debounced 300 ms.
  useEffect(() => {
    const term = text.trim();
    if (dest || term.length < 2) { setSuggestions([]); return; }
    let off = false;
    const t = setTimeout(async () => {
      try { const r = await toursApi.destinations(term); if (!off) setSuggestions(r.slice(0, 8)); } catch { if (!off) setSuggestions([]); }
    }, 300);
    return () => { off = true; clearTimeout(t); };
  }, [text, dest]);

  const params = (q: Query, p: number) => ({
    destinationId: q.destinationId, q: q.destinationId ? undefined : q.q,
    sort: q.destinationId ? q.sort : undefined, // sort only applies to destination search
    page: p, count: COUNT,
  });

  useEffect(() => {
    if (!query) return;
    let off = false;
    setLoading(true); setError(null); setItems([]);
    toursApi.search(params(query, 1))
      .then((r) => { if (off) return; setItems(r.data); setTotal(r.total); setPage(1); })
      .catch((e) => { if (!off) setError(friendlyError(e)); })
      .finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
  }, [query]);

  const loadMore = useCallback(async () => {
    if (!query) return;
    setLoadingMore(true);
    try {
      const r = await toursApi.search(params(query, page + 1));
      setItems((i) => [...i, ...r.data]); setPage(page + 1); setTotal(r.total);
    } catch (e) { setError(friendlyError(e)); }
    finally { setLoadingMore(false); }
  }, [query, page]);

  // Infinite scroll.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting && items.length > 0 && items.length < total && !loading && !loadingMore) loadMore();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [items.length, total, loading, loadingMore, loadMore]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (dest) return setQuery({ destinationId: dest.id, sort: query?.sort ?? "default" });
    const q = text.trim();
    if (!q) return setError("Enter a destination or an activity to search");
    setQuery({ q, sort: "default" });
  };

  return (
    <div className="space-y-6">
      <SubPageHeader title="Tours" subtitle="Tours and activities worldwide" back="/dashboard/services" />
      <form onSubmit={onSearch} className="space-y-3" noValidate>
        <div className="relative">
          <FormField label="Where to?" icon={Search} placeholder="Lagos, Paris, safari…" value={text}
            onChange={(e) => { setText(e.target.value); setDest(null); }} />
          {suggestions.length > 0 && (
            <ul role="listbox" className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border bg-[rgb(var(--bg-elevated))] shadow-lg">
              {suggestions.map((d) => (
                <li key={d.id}>
                  <button type="button" role="option" aria-selected={false} onClick={() => { setDest(d); setText(d.name); setSuggestions([]); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-brand-500/5">
                    <MapPin className="h-4 w-4 text-[rgb(var(--fg-muted))]" /> <span className="font-semibold">{d.name}</span>
                    <span className="ml-auto text-xs text-[rgb(var(--fg-muted))]">{d.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <PrimaryButton type="submit">Search tours</PrimaryButton>
      </form>

      {query?.destinationId && (
        <PillSelect label="Sort by" value={query.sort} onChange={(v) => setQuery({ ...query, sort: v })} options={SORTS} />
      )}

      <ErrorText>{error}</ErrorText>
      {!query ? <Box><Compass className="mx-auto mb-2 h-7 w-7" />Search a destination to discover tours</Box>
        : loading ? <Loading text="Finding tours…" />
        : items.length === 0 && !error ? <Box>No tours found</Box>
        : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((t) => (
              <Link key={t.code} href={`/dashboard/services/tours/${encodeURIComponent(t.code)}`}
                className="overflow-hidden rounded-2xl border bg-[rgb(var(--bg-elevated))] transition-colors hover:border-brand-500/50">
                {t.image
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={t.image} alt="" loading="lazy" className="h-40 w-full object-cover" />
                  : <div className="flex h-40 items-center justify-center bg-teal-500/10"><Compass className="h-8 w-8 text-teal-500" /></div>}
                <div className="space-y-1.5 p-4">
                  <p className="line-clamp-2 font-bold leading-snug">{t.title}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[rgb(var(--fg-muted))]">
                    {t.rating != null && <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{t.rating.toFixed(1)}{t.reviewCount != null && ` (${t.reviewCount})`}</span>}
                    {t.durationMinutes ? <span>{formatDuration(t.durationMinutes)}</span> : null}
                  </div>
                  <p className="text-sm font-bold text-brand-500">{t.fromPrice != null ? `From ${formatMoney(t.fromPrice, t.currency ?? "USD")}` : "Price on Viator"}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      <div ref={sentinel} className="h-6" />
      {loadingMore && <Loading text="Loading more…" />}
    </div>
  );
}
