"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Camera, CreditCard, Hash, Landmark, Lock, MapPin } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { FormField, SubmitButton } from "@/components/dashboard/form-field";
import { usePinPrompt } from "@/components/dashboard/pin-prompt-context";
import { FeatureGate } from "@/components/dashboard/feature-gate";
import { Badge, Box, Card, ErrorText, Label, Loading, PillSelect, PrimaryButton, statusTone } from "@/components/dashboard/ui-bits";
import { useApiData } from "@/hooks/use-api-data";
import { cardsApi, isPending, type Cardholder, type CardQuote } from "@/lib/api/extra-services";
import { purchaseWithPinRetry } from "@/lib/purchase-with-pin-retry";
import { friendlyError, goPending, handleActionError } from "@/lib/action-helpers";
import { FLAGS } from "@/lib/feature-flags";
import { formatDate, formatUsd } from "@/lib/format";
import { formatNaira } from "@/lib/utils";

export default function CardsPage() {
  return (
    <FeatureGate enabled={FLAGS.cards} title="USD Cards" subtitle="Virtual dollar cards for online payments">
      <Cards />
    </FeatureGate>
  );
}

function Cards() {
  const holder = useApiData(() => cardsApi.cardholder());
  const status = holder.data?.status;

  // "Verifying": poll every 20 s (a push also arrives when it settles).
  useEffect(() => {
    if (status !== "pending") return;
    const t = setInterval(() => holder.refresh(), 20_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="space-y-6">
      <SubPageHeader title="USD Cards" subtitle="Virtual dollar cards for online payments" back="/dashboard/services" />
      {holder.loading ? <Loading />
        : holder.error || !holder.data ? <ErrorText>{friendlyError(holder.error)}</ErrorText>
        : status === "pending" ? <Box><p className="font-semibold">Verifying your identity…</p><p className="mt-1">This usually takes a few minutes. We&apos;ll notify you.</p></Box>
        : status === "manual_review" ? <Box><p className="font-semibold">Under review</p><p className="mt-1">Your details are being reviewed. This can take up to 24 hours.</p></Box>
        : status === "verified" ? <Verified holder={holder.data} />
        : <Verification holder={holder.data} onSubmitted={holder.refresh} />}
    </div>
  );
}

/* ---------------------------- Step 1: identity ---------------------------- */
function Verification({ holder, onSubmitted }: { holder: Cardholder; onSubmitted: () => void }) {
  const [f, setF] = useState({ bvn: "", address: "", city: "", state: "", postalCode: "", houseNo: "" });
  const [selfie, setSelfie] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^\d{11}$/.test(f.bvn)) next.bvn = "BVN must be 11 digits";
    (["address", "city", "state", "postalCode", "houseNo"] as const).forEach((k) => { if (!f[k].trim()) next[k] = "Required"; });
    if (!selfie) next.selfie = "Take a clear photo of your face";
    else if (!["image/jpeg", "image/png"].includes(selfie.type)) next.selfie = "Use a JPEG or PNG image";
    else if (selfie.size > 5 * 1024 * 1024) next.selfie = "Image must be 5 MB or smaller";
    if (Object.keys(next).length) return setErrors(next);
    setErrors({}); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => fd.append(k, v.trim()));
      fd.append("selfie", selfie!);
      await cardsApi.submitCardholder(fd);
      onSubmitted();
    } catch (err) { setErrors({ form: friendlyError(err) }); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Card className="space-y-1 text-sm">
        <p className="font-bold">Verify your identity (one time)</p>
        <p className="text-[rgb(var(--fg-muted))]">
          Your profile name must match your BVN. Your BVN is used for this one check and is not stored by us. Card issue fee: {formatUsd(holder.issueFeeUsd)}.
        </p>
      </Card>
      {holder.status === "failed" && holder.reason && <ErrorText>Verification failed: {holder.reason}</ErrorText>}
      <FormField label="BVN" icon={Landmark} inputMode="numeric" maxLength={11} placeholder="11-digit BVN" value={f.bvn} onChange={(e) => setF((s) => ({ ...s, bvn: e.target.value.replace(/\D/g, "") }))} error={errors.bvn} />
      <FormField label="House number" icon={Hash} placeholder="12" value={f.houseNo} onChange={set("houseNo")} error={errors.houseNo} />
      <FormField label="Street address" icon={MapPin} placeholder="Example Street" value={f.address} onChange={set("address")} error={errors.address} />
      <FormField label="City" icon={Building2} placeholder="Owerri" value={f.city} onChange={set("city")} error={errors.city} />
      <FormField label="State" icon={MapPin} placeholder="Imo" value={f.state} onChange={set("state")} error={errors.state} />
      <FormField label="Postal code" icon={Hash} inputMode="numeric" placeholder="460001" value={f.postalCode} onChange={set("postalCode")} error={errors.postalCode} />
      <div className="space-y-2">
        <Label>Selfie</Label>
        <label className="flex cursor-pointer items-center gap-3 rounded-full border bg-[rgb(var(--bg-elevated))] px-5 py-3.5 text-sm">
          <Camera className="h-5 w-5 text-[rgb(var(--fg-muted))]" />
          <span className="truncate">{selfie ? selfie.name : "Take or choose a clear face photo (JPEG/PNG, max 5 MB)"}</span>
          <input type="file" accept="image/jpeg,image/png" capture="user" className="sr-only" onChange={(e) => setSelfie(e.target.files?.[0] ?? null)} />
        </label>
        {errors.selfie && <p className="text-xs text-red-500">{errors.selfie}</p>}
      </div>
      <ErrorText>{errors.form}</ErrorText>
      <SubmitButton loading={loading}>Submit for verification</SubmitButton>
    </form>
  );
}

/* ---------------------------- Step 2/3: cards ---------------------------- */
function Verified({ holder }: { holder: Cardholder }) {
  const cards = useApiData(() => cardsApi.list());
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-6">
      {creating ? <CreateCard holder={holder} onCancel={() => setCreating(false)} /> : <PrimaryButton onClick={() => setCreating(true)}>Create a new card</PrimaryButton>}
      <div className="space-y-3">
        <Label>Your cards</Label>
        {cards.loading ? <Loading />
          : cards.error ? <ErrorText>{friendlyError(cards.error)}</ErrorText>
          : (cards.data ?? []).length === 0 ? <Box>No cards yet</Box>
          : (cards.data ?? []).map((c) => (
              <Link key={c.id} href={`/dashboard/services/cards/${c.id}`} className="flex items-center gap-4 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 transition-colors hover:border-brand-500/50">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-500/15"><CreditCard className="h-5 w-5 text-pink-500" /></span>
                <div className="flex-1">
                  <p className="font-bold">USD card · {formatUsd(c.limitUsd)} limit</p>
                  <p className="text-xs text-[rgb(var(--fg-muted))]">Created {formatDate(c.createdAt)}</p>
                </div>
                <Badge tone={statusTone(c.status)}>{c.status}</Badge>
              </Link>
            ))}
      </div>
    </div>
  );
}

function CreateCard({ holder, onCancel }: { holder: Cardholder; onCancel: () => void }) {
  const router = useRouter();
  const { requestPin } = usePinPrompt();
  const limits = holder.limits;
  const [limit, setLimit] = useState(String(limits[0]?.limitUsd ?? 5000));
  const [funding, setFunding] = useState("");
  const [cardPin, setCardPin] = useState("");
  const [quote, setQuote] = useState<CardQuote | null>(null);
  const [qLoading, setQLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const min = limits.find((l) => String(l.limitUsd) === limit)?.minFundingUsd ?? 3;
  const n = Number(funding);
  const valid = Number.isFinite(n) && n >= min;

  useEffect(() => {
    setQuote(null);
    if (!valid) return;
    let off = false;
    const t = setTimeout(async () => {
      setQLoading(true);
      try { const q = await cardsApi.quote({ type: "create", amountUsd: n }); if (!off) setQuote(q); }
      catch (e) { if (!off) setErrors((s) => ({ ...s, form: friendlyError(e) })); }
      finally { if (!off) setQLoading(false); }
    }, 400);
    return () => { off = true; clearTimeout(t); };
  }, [valid, n]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!valid) next.funding = `Minimum funding is ${formatUsd(min)}`;
    if (!/^\d{4}$/.test(cardPin)) next.cardPin = "Card PIN must be 4 digits";
    if (Object.keys(next).length) return setErrors(next);
    setErrors({}); setLoading(true);
    try {
      const r = await purchaseWithPinRetry((pin) => cardsApi.create({ limit: Number(limit), fundingUsd: n, cardPin, transactionPin: pin }), requestPin);
      if (r === null) return;
      if (isPending(r)) return goPending(router, r, "Creating your card");
      router.replace(`/dashboard/services/cards/${r.card.id}`);
    } catch (err) { handleActionError(err, router, (m) => setErrors({ form: m }), { purchase: true }); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4" noValidate>
      <p className="font-display text-base font-bold">New USD card</p>
      <PillSelect label="Card limit" value={limit} onChange={setLimit} options={limits.map((l) => ({ value: String(l.limitUsd), label: `${formatUsd(l.limitUsd)} (min funding ${formatUsd(l.minFundingUsd)})` }))} />
      <FormField label="Initial funding (USD)" icon={CreditCard} inputMode="decimal" placeholder={String(min)} value={funding} onChange={(e) => setFunding(e.target.value.replace(/[^\d.]/g, ""))} error={errors.funding} />
      <FormField label="Card PIN (4 digits)" icon={Lock} inputMode="numeric" maxLength={4} isPassword placeholder="••••" value={cardPin} onChange={(e) => setCardPin(e.target.value.replace(/\D/g, ""))} error={errors.cardPin} />
      <p className="-mt-3 text-xs text-[rgb(var(--fg-muted))]">This PIN is for the card itself. It is different from your transaction PIN, which you&apos;ll be asked for next.</p>
      {valid && quote && (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-[rgb(var(--fg-muted))]">Funding</span><span>{formatUsd(quote.amountUsd)}</span></div>
          <div className="flex justify-between"><span className="text-[rgb(var(--fg-muted))]">Issue fee</span><span>{formatUsd(quote.issueFeeUsd)}</span></div>
          <div className="flex justify-between font-bold"><span>You pay</span><span className="text-brand-500">{formatNaira(quote.priceNgn)}</span></div>
        </div>
      )}
      <ErrorText>{errors.form}</ErrorText>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="rounded-full border px-5 py-3 text-sm font-semibold">Cancel</button>
        <div className="flex-1"><SubmitButton loading={loading || qLoading}>Create card</SubmitButton></div>
      </div>
    </form>
  );
}
