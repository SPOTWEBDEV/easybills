"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DollarSign, Snowflake } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { FormField, SubmitButton } from "@/components/dashboard/form-field";
import { usePinPrompt } from "@/components/dashboard/pin-prompt-context";
import { FeatureGate } from "@/components/dashboard/feature-gate";
import { Badge, Box, Card, CopyButton, ErrorText, GhostButton, Label, Loading } from "@/components/dashboard/ui-bits";
import { useApiData } from "@/hooks/use-api-data";
import { cardsApi, type CardQuote, type CardSecrets } from "@/lib/api/extra-services";
import { purchaseWithPinRetry } from "@/lib/purchase-with-pin-retry";
import { friendlyError, handleActionError } from "@/lib/action-helpers";
import { FLAGS } from "@/lib/feature-flags";
import { formatDateTime, formatUsd } from "@/lib/format";
import { cn, formatNaira } from "@/lib/utils";

export default function CardDetailPage() {
  return (
    <FeatureGate enabled={FLAGS.cards} title="USD Card" subtitle="Manage your virtual card">
      <Detail />
    </FeatureGate>
  );
}

function Detail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { requestPin } = usePinPrompt();
  const card = useApiData(() => cardsApi.get(id), [id]);
  const txs = useApiData(() => cardsApi.transactions(id), [id]);
  const [secrets, setSecrets] = useState<CardSecrets | null>(null);
  const [busy, setBusy] = useState<"reveal" | "freeze" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Card details live in memory only: auto-hide after 30 s, when the tab is hidden or loses focus, and on unmount.
  // (Browsers can't block screenshots like a native app can, so we keep the exposure window short.)
  useEffect(() => {
    if (!secrets) return;
    const hide = () => setSecrets(null);
    const t = setTimeout(hide, 30_000);
    const onVis = () => { if (document.hidden) hide(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", hide);
    return () => { clearTimeout(t); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("blur", hide); };
  }, [secrets]);

  const reveal = async () => {
    setError(null); setBusy("reveal");
    try {
      const r = await purchaseWithPinRetry((pin) => cardsApi.reveal(id, pin), requestPin);
      if (r) setSecrets(r);
    } catch (err) { handleActionError(err, router, setError); }
    finally { setBusy(null); }
  };

  const toggleFreeze = async () => {
    if (!card.data) return;
    setError(null); setBusy("freeze");
    try { await (card.data.isActive ? cardsApi.freeze(id) : cardsApi.unfreeze(id)); card.refresh(); }
    catch (err) { setError(friendlyError(err)); }
    finally { setBusy(null); }
  };

  const c = card.data;
  return (
    <div className="space-y-6">
      <SubPageHeader title="USD Card" subtitle="Manage your virtual card" back="/dashboard/services/cards" />
      {card.loading ? <Loading />
        : card.error || !c ? <ErrorText>{friendlyError(card.error)} <button type="button" onClick={card.refresh} className="font-bold underline">Retry</button></ErrorText>
        : (
          <>
            <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-emerald-500 p-5 text-white shadow-glow">
              <div className="flex items-center justify-between text-sm font-semibold"><span>{c.brand}</span><Badge tone={c.isActive ? "success" : "pending"}>{c.isActive ? "active" : "frozen"}</Badge></div>
              {secrets ? (
                <div className="mt-6 space-y-2">
                  <p className="break-all font-mono text-xl font-bold tracking-widest">{secrets.cardNumber.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim()}</p>
                  <p className="text-sm">{secrets.cardName}</p>
                  <p className="font-mono text-sm">Exp {String(secrets.expiryMonth).padStart(2, "0")}/{String(secrets.expiryYear).slice(-2)} · CVV {secrets.cvv}</p>
                </div>
              ) : <p className="mt-6 font-mono text-xl font-bold tracking-widest">•••• •••• •••• {c.last4}</p>}
              <p className="mt-6 text-xs opacity-80">Available balance</p>
              <p className="font-display text-3xl font-bold">{formatUsd(c.availableBalance)}</p>
            </div>

            {secrets && (
              <Card className="flex flex-wrap items-center gap-4 text-sm">
                <CopyButton value={secrets.cardNumber.replace(/\s/g, "")} label="Copy number" />
                <CopyButton value={String(secrets.cvv)} label="Copy CVV" />
                <button type="button" onClick={() => setSecrets(null)} className="ml-auto font-bold text-[rgb(var(--fg-muted))]">Hide</button>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-3">
              <GhostButton onClick={reveal} disabled={busy !== null || !!secrets}>{busy === "reveal" ? "Please wait…" : "Show details"}</GhostButton>
              <GhostButton onClick={toggleFreeze} disabled={busy !== null} className={cn("inline-flex items-center justify-center gap-2", c.isActive && "text-blue-500")}>
                <Snowflake className="h-4 w-4" /> {busy === "freeze" ? "…" : c.isActive ? "Freeze" : "Unfreeze"}
              </GhostButton>
            </div>
            <ErrorText>{error}</ErrorText>
            {notice && <p role="status" className="rounded-2xl bg-amber-500/10 p-3 text-center text-sm text-amber-500">{notice}</p>}

            <FundForm id={id} onAccepted={(m) => {
              setNotice(m);
              // Funding is asynchronous: refresh after a few seconds (a push also arrives).
              setTimeout(() => { card.refresh(); txs.refresh(); }, 8000);
            }} />
          </>
        )}

      <div className="space-y-3">
        <Label>Card transactions</Label>
        {txs.loading ? <Loading />
          : txs.error ? <ErrorText>{friendlyError(txs.error)}</ErrorText>
          : (txs.data ?? []).length === 0 ? <Box>No card transactions yet</Box>
          : (txs.data ?? []).map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{t.merchant || t.description}</p>
                  <p className="text-xs text-[rgb(var(--fg-muted))]">{formatDateTime(t.date)}</p>
                </div>
                <p className={cn("shrink-0 text-sm font-bold", t.type.toUpperCase() === "DEBIT" ? "text-red-500" : "text-emerald-500")}>
                  {t.type.toUpperCase() === "DEBIT" ? "−" : "+"}{formatUsd(t.amount)}
                </p>
              </div>
            ))}
      </div>
    </div>
  );
}

function FundForm({ id, onAccepted }: { id: string; onAccepted: (message: string) => void }) {
  const router = useRouter();
  const { requestPin } = usePinPrompt();
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<CardQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const n = Number(amount);
  const valid = Number.isFinite(n) && n >= 1;

  useEffect(() => {
    setQuote(null);
    if (!valid) return;
    let off = false;
    const t = setTimeout(async () => {
      try { const q = await cardsApi.quote({ type: "fund", amountUsd: n }); if (!off) setQuote(q); } catch { /* quote is informational */ }
    }, 400);
    return () => { off = true; clearTimeout(t); };
  }, [valid, n]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return setError("Minimum funding is $1.00");
    setError(null); setLoading(true);
    try {
      const r = await purchaseWithPinRetry((pin) => cardsApi.fund(id, { amountUsd: n, transactionPin: pin }), requestPin);
      if (r === null) return;
      setAmount("");
      onAccepted(r.message ?? "Funding in progress. Your balance will update shortly. Please don't retry.");
    } catch (err) { handleActionError(err, router, setError, { purchase: true }); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4" noValidate>
      <p className="font-display text-base font-bold">Fund card</p>
      <FormField label="Amount (USD)" icon={DollarSign} inputMode="decimal" placeholder="20" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
      {valid && quote && <p className="text-sm">You pay <b className="text-brand-500">{formatNaira(quote.priceNgn)}</b></p>}
      <p className="text-xs text-[rgb(var(--fg-muted))]">Funding takes a moment to arrive. A card can be funded about once every 5 minutes.</p>
      <ErrorText>{error}</ErrorText>
      <SubmitButton loading={loading}>Fund card</SubmitButton>
    </form>
  );
}
