"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, Gift, Search } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { FormField, SubmitButton } from "@/components/dashboard/form-field";
import { usePinPrompt } from "@/components/dashboard/pin-prompt-context";
import { FeatureGate } from "@/components/dashboard/feature-gate";
import { Box, Card, ErrorText, Label, Loading, PillSelect, SecretValue, GhostButton } from "@/components/dashboard/ui-bits";
import { giftcardsApi, isPending, type GiftBuyResult, type GiftProduct } from "@/lib/api/extra-services";
import { purchaseWithPinRetry } from "@/lib/purchase-with-pin-retry";
import { friendlyError, goPending, handleActionError } from "@/lib/action-helpers";
import { FLAGS } from "@/lib/feature-flags";
import { formatMoney } from "@/lib/format";
import { cn, formatNaira } from "@/lib/utils";

const PAGE_SIZE = 20;
const COUNTRIES = [
  { value: "", label: "All countries" }, { value: "NG", label: "Nigeria" }, { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" }, { value: "CA", label: "Canada" }, { value: "DE", label: "Germany" },
];

export default function GiftCardsPage() {
  return (
    <FeatureGate enabled={FLAGS.giftCards} title="Gift Cards" subtitle="Buy gift cards instantly">
      <GiftCards />
    </FeatureGate>
  );
}

function GiftCards() {
  const [product, setProduct] = useState<GiftProduct | null>(null);
  return product ? <BuyPanel product={product} onBack={() => setProduct(null)} /> : <Catalogue onPick={setProduct} />;
}

function Catalogue({ onPick }: { onPick: (p: GiftProduct) => void }) {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const [country, setCountry] = useState("");
  const [items, setItems] = useState<GiftProduct[]>([]);
  const [page, setPage] = useState(0); // zero-based, as the API expects
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { const t = setTimeout(() => setDq(q.trim()), 300); return () => clearTimeout(t); }, [q]);

  useEffect(() => {
    let off = false;
    setLoading(true); setError(null);
    giftcardsApi.products({ q: dq || undefined, country: country || undefined, page: 0, size: PAGE_SIZE })
      .then((r) => { if (off) return; setItems(r); setPage(0); setMore(r.length === PAGE_SIZE); })
      .catch((e) => { if (!off) setError(friendlyError(e)); })
      .finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
  }, [dq, country]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const r = await giftcardsApi.products({ q: dq || undefined, country: country || undefined, page: page + 1, size: PAGE_SIZE });
      setItems((i) => [...i, ...r]); setPage(page + 1); setMore(r.length === PAGE_SIZE);
    } catch (e) { setError(friendlyError(e)); }
    finally { setLoadingMore(false); }
  };

  return (
    <div className="space-y-6">
      <SubPageHeader title="Gift Cards" subtitle="Buy gift cards instantly" back="/dashboard/services" />
      <Link href="/dashboard/services/gift-cards/orders" className="flex items-center justify-between rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 text-sm font-bold text-brand-500">
        My gift cards <span aria-hidden>→</span>
      </Link>
      <FormField label="Search" icon={Search} placeholder="Amazon, iTunes, Steam…" value={q} onChange={(e) => setQ(e.target.value)} />
      <PillSelect label="Country" value={country} onChange={setCountry} options={COUNTRIES} />
      {loading ? <Loading text="Loading gift cards…" />
        : error ? <ErrorText>{error}</ErrorText>
        : items.length === 0 ? <Box>No gift cards found</Box>
        : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((p) => (
                <button key={p.id} type="button" onClick={() => onPick(p)}
                  className="flex flex-col items-center gap-2 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 text-center transition-colors hover:border-brand-500/50">
                  {p.logo
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={p.logo} alt="" className="h-14 w-14 rounded-xl bg-white object-contain" />
                    : <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/15"><Gift className="h-6 w-6 text-amber-500" /></span>}
                  <p className="line-clamp-2 text-sm font-bold">{p.name}</p>
                  <p className="text-xs text-[rgb(var(--fg-muted))]">
                    {p.country} · {p.type === "range" && p.min != null && p.max != null ? `${formatMoney(p.min, p.currency)} – ${formatMoney(p.max, p.currency)}` : p.currency}
                  </p>
                </button>
              ))}
            </div>
            {more && <GhostButton onClick={loadMore} disabled={loadingMore} className="w-full">{loadingMore ? "Loading…" : "Load more"}</GhostButton>}
          </>
        )}
    </div>
  );
}

function BuyPanel({ product: p, onBack }: { product: GiftProduct; onBack: () => void }) {
  const router = useRouter();
  const { requestPin } = usePinPrompt();
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<{ price: number } | null>(null);
  const [qLoading, setQLoading] = useState(false);
  const [qError, setQError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<GiftBuyResult | null>(null);

  const n = Number(amount);
  const valid = Number.isFinite(n) && n > 0 && (p.type === "fixed"
    ? (p.denominations ?? []).includes(n)
    : (p.min == null || n >= p.min) && (p.max == null || n <= p.max));

  // Server price for the chosen amount. Never calculated on the client. Debounced for range cards.
  useEffect(() => {
    setQuote(null); setQError(null);
    if (!valid) return;
    let off = false;
    const t = setTimeout(async () => {
      setQLoading(true);
      try { const r = await giftcardsApi.quote(p.id, n); if (!off) setQuote({ price: r.price }); }
      catch (e) { if (!off) setQError(friendlyError(e)); }
      finally { if (!off) setQLoading(false); }
    }, 400);
    return () => { off = true; clearTimeout(t); };
  }, [amount, valid, n, p.id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return setError("Choose a valid amount first");
    if (!quote) return setError("Wait for the price to load");
    setError(null); setLoading(true);
    try {
      const r = await purchaseWithPinRetry((pin) => giftcardsApi.buy({ productId: p.id, amount: n, transactionPin: pin }), requestPin);
      if (r === null) return;
      if (isPending(r)) return goPending(router, r);
      setDone(r);
    } catch (err) { handleActionError(err, router, setError, { purchase: true }); }
    finally { setLoading(false); }
  };

  if (done) {
    const codes = done.codes ?? [];
    return (
      <div className="space-y-5">
        <SubPageHeader title="Purchase successful" subtitle={`${p.name} · ${formatMoney(n, p.currency)}`} back="/dashboard/services" />
        {codes.length === 0 ? (
          <Box>Your code isn&apos;t ready yet. Open <b>My gift cards</b> in a moment and tap <b>View code</b>.</Box>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-amber-500">Save your code now. Later you&apos;ll need your PIN to view it again.</p>
            {codes.map((c, i) => (
              <Card key={i} className="space-y-2">
                {c.code && <SecretValue label="Code" value={c.code} defaultShown />}
                {c.pin && <SecretValue label="PIN" value={c.pin} defaultShown />}
                {c.redemptionUrl && <a href={c.redemptionUrl} target="_blank" rel="noopener noreferrer" className="block text-sm font-bold text-brand-500">Redeem online →</a>}
              </Card>
            ))}
          </div>
        )}
        {p.redeemInstruction && <p className="text-xs text-[rgb(var(--fg-muted))]">{p.redeemInstruction}</p>}
        <div className="flex gap-3">
          <Link href="/dashboard/services/gift-cards/orders" className="flex-1 rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 py-3.5 text-center text-sm font-bold text-white">My gift cards</Link>
          <button type="button" onClick={onBack} className="flex-1 rounded-full border py-3.5 text-sm font-semibold">Buy another</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-500"><ArrowLeft className="h-4 w-4" /> All gift cards</button>
      <Card className="flex items-center gap-4">
        {p.logo
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={p.logo} alt="" className="h-14 w-14 rounded-xl bg-white object-contain" />
          : <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/15"><Gift className="h-6 w-6 text-amber-500" /></span>}
        <div>
          <p className="font-display text-lg font-bold">{p.name}</p>
          <p className="text-xs text-[rgb(var(--fg-muted))]">{p.country} · card value in {p.currency}</p>
        </div>
      </Card>

      <div className="space-y-3">
        <Label>Amount</Label>
        {p.type === "fixed" ? (
          <div role="radiogroup" aria-label="Amount" className="grid grid-cols-3 gap-3">
            {(p.denominations ?? []).map((d) => (
              <button key={d} type="button" role="radio" aria-checked={n === d} onClick={() => setAmount(String(d))}
                className={cn("rounded-2xl border bg-[rgb(var(--bg-elevated))] py-3 text-sm font-bold", n === d && "border-brand-500 bg-brand-500/5 text-brand-500")}>
                {formatMoney(d, p.currency)}
              </button>
            ))}
          </div>
        ) : (
          <FormField label={`Enter amount (${p.min ?? "any"} – ${p.max ?? "any"} ${p.currency})`} icon={Banknote} inputMode="decimal" placeholder="25"
            value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            error={amount && !valid ? "Amount is outside this card's range" : undefined} />
        )}
      </div>

      {valid && (
        <Card className="flex items-center justify-between">
          <span className="text-sm text-[rgb(var(--fg-muted))]">You pay</span>
          <span className="font-display text-xl font-bold text-brand-500">
            {qLoading ? "…" : quote ? formatNaira(quote.price) : "—"}
          </span>
        </Card>
      )}
      <ErrorText>{qError}</ErrorText>
      <ErrorText>{error}</ErrorText>
      <SubmitButton loading={loading || qLoading}>Buy now</SubmitButton>
    </form>
  );
}
