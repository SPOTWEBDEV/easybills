"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tv } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { NetworkPicker } from "@/components/dashboard/network-picker";
import { FormField, SubmitButton } from "@/components/dashboard/form-field";
import { usePinPrompt } from "@/components/dashboard/pin-prompt-context";
import { useApiData } from "@/hooks/use-api-data";
import { cableApi, type Bouquet } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { purchaseWithPinRetry } from "@/lib/purchase-with-pin-retry";
import { cn, formatNaira } from "@/lib/utils";

export default function PayCablePage() {
  const router = useRouter();
  const { requestPin } = usePinPrompt();
  const providers = useApiData(() => cableApi.providers());
  const [provider, setProvider] = useState<string | null>(null);
  const [smartcard, setSmartcard] = useState("");
  const [bouquetId, setBouquetId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Bouquets load only after the smartcard is verified.
  const bouquetsQuery = useApiData(() => (provider && verifiedName ? cableApi.bouquets(provider) : Promise.resolve([] as Bouquet[])), [provider, verifiedName]);
  const bouquets = useMemo(() => {
    const seen = new Set<string>();
    return (bouquetsQuery.data ?? []).filter((b) => { const k = b.plancode || b.code; if (seen.has(k)) return false; seen.add(k); return true; });
  }, [bouquetsQuery.data]);

  const onVerify = async () => {
    if (!provider) return setErrors((e) => ({ ...e, provider: "Select a provider first" }));
    if (smartcard.trim().length < 5) return setErrors((e) => ({ ...e, smartcardNumber: "Enter a valid smartcard/IUC number" }));
    setErrors((e) => ({ ...e, smartcardNumber: "", provider: "" })); setVerifying(true);
    try { setVerifiedName((await cableApi.lookup({ providerId: provider, smartcardNumber: smartcard.trim() })).customerName); }
    catch (err) { setVerifiedName(null); setErrors((e) => ({ ...e, smartcardNumber: err instanceof ApiError ? err.message : "Couldn't verify this smartcard number." })); }
    finally { setVerifying(false); }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!provider) next.provider = "Select a provider";
    if (smartcard.trim().length < 5) next.smartcardNumber = "Enter a valid smartcard/IUC number";
    else if (!verifiedName) next.smartcardNumber = "Verify your smartcard number first";
    if (!bouquetId) next.bouquet = "Select a bouquet";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      const r = await purchaseWithPinRetry((pin) => cableApi.purchase({ providerId: provider!, bouquetId: bouquetId!, smartcardNumber: smartcard.trim(), transactionPin: pin }), requestPin);
      if (r === null) return;
      router.replace("/dashboard/payment-status?status=success");
    } catch (err) { setErrors({ form: err instanceof ApiError ? err.message : "Something went wrong. Please try again." }); }
    finally { setLoading(false); }
  };

  const label = "text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]";
  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <SubPageHeader title="Pay Cable TV" subtitle="DStv, GOtv & StarTimes subscriptions" />
      <div className="space-y-3">
        <p className={label}>Provider</p>
        {providers.loading ? <p className="text-sm text-[rgb(var(--fg-muted))]">Loading…</p>
          : <NetworkPicker providers={providers.data ?? []} value={provider} onChange={(id) => { setProvider(id); setBouquetId(null); setVerifiedName(null); }} />}
        {errors.provider && <p className="text-xs text-red-500">{errors.provider}</p>}
      </div>

      <div>
        <FormField label="Smartcard / IUC number" icon={Tv} inputMode="numeric" placeholder="1234567890" value={smartcard}
          onChange={(e) => { setSmartcard(e.target.value); setVerifiedName(null); setBouquetId(null); }} error={errors.smartcardNumber} />
        <button type="button" onClick={onVerify} disabled={verifying} className="mt-2 text-sm font-bold text-brand-500">
          {verifying ? "Verifying…" : verifiedName ? "Verified ✓" : "Verify smartcard"}
        </button>
        {verifiedName && <p role="status" className="mt-1 text-sm font-semibold text-emerald-500">Customer: {verifiedName}</p>}
      </div>

      <div className="space-y-3">
        <p className={label}>Bouquet</p>
        {!provider ? <Box>Choose a provider to see available bouquets</Box>
          : !verifiedName ? <Box>Verify your smartcard number to see available bouquets</Box>
          : bouquetsQuery.loading ? <p className="text-sm text-[rgb(var(--fg-muted))]">Loading bouquets…</p>
          : bouquets.length === 0 ? <Box>No bouquets available for this provider right now</Box>
          : <div role="radiogroup" aria-label="Bouquet" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {bouquets.map((b) => { const id = b.plancode || b.code; const active = bouquetId === id; return (
                <button key={id} type="button" role="radio" aria-checked={active} onClick={() => setBouquetId(id)}
                  className={cn("flex min-h-24 flex-col justify-between rounded-2xl border bg-[rgb(var(--bg-elevated))] p-3 text-left", active && "border-brand-500 bg-brand-500/5")}>
                  <span><span className="block text-sm font-bold">{b.name}</span><span className="text-xs text-[rgb(var(--fg-muted))]">{b.validity}</span></span>
                  <span className="mt-2 text-sm font-bold text-brand-500">{formatNaira(b.price)}</span>
                </button>); })}
            </div>}
        {errors.bouquet && <p className="text-xs text-red-500">{errors.bouquet}</p>}
      </div>
      {errors.form && <p className="text-center text-sm text-red-500">{errors.form}</p>}
      {verifiedName && <SubmitButton loading={loading}>Continue</SubmitButton>}
    </form>
  );
}
function Box({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-[rgb(var(--fg-muted))]">{children}</div>;
}
