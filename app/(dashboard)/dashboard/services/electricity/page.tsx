"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Zap } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { NetworkPicker } from "@/components/dashboard/network-picker";
import { AmountField } from "@/components/dashboard/amount-field";
import { FormField, SubmitButton } from "@/components/dashboard/form-field";
import { usePinPrompt } from "@/components/dashboard/pin-prompt-context";
import { useApiData } from "@/hooks/use-api-data";
import { electricityApi, type MeterType } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { purchaseWithPinRetry } from "@/lib/purchase-with-pin-retry";
import { electricitySchema } from "@/lib/validators/schemas";
import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000].map((v) => ({ label: `₦${v.toLocaleString()}`, value: v }));
const METER_TYPES: { id: MeterType; label: string }[] = [{ id: "prepaid", label: "Prepaid" }, { id: "postpaid", label: "Postpaid" }];

// Built from the API + electricitySchema (the mobile screen wasn't shared): verify the meter, then pay.
export default function PayElectricityPage() {
  const { requestPin } = usePinPrompt();
  const providers = useApiData(() => electricityApi.providers());
  const [provider, setProvider] = useState<string | null>(null);
  const [meterType, setMeterType] = useState<MeterType>("prepaid");
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [customer, setCustomer] = useState<{ customerName: string; address: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ token?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const invalidate = () => setCustomer(null); // any change to the meter details voids the verification

  const onVerify = async () => {
    const base = { providerId: provider ?? "", meterType, meterNumber: meterNumber.trim(), amount: 500 };
    const parsed = electricitySchema.safeParse(base);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) if (i.path[0] !== "amount") next[String(i.path[0])] ??= i.message;
      if (Object.keys(next).length) return setErrors(next);
    }
    setErrors({}); setVerifying(true);
    try { setCustomer(await electricityApi.lookup({ providerId: base.providerId, meterNumber: base.meterNumber, meterType })); }
    catch (err) { setCustomer(null); setErrors({ meterNumber: err instanceof ApiError ? err.message : "Couldn't verify this meter number." }); }
    finally { setVerifying(false); }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = electricitySchema.safeParse({ providerId: provider ?? "", meterType, meterNumber: meterNumber.trim(), amount });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] ??= i.message;
      return setErrors(next);
    }
    if (!customer) return setErrors({ meterNumber: "Verify your meter number first" });
    setErrors({}); setLoading(true);
    try {
      const r = await purchaseWithPinRetry((pin) => electricityApi.purchase({ ...parsed.data, transactionPin: pin }), requestPin);
      if (r === null) return;
      setDone({ token: r.token });
    } catch (err) { setErrors({ form: err instanceof ApiError ? err.message : "Something went wrong. Please try again." }); }
    finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="space-y-5">
        <SubPageHeader title="Payment successful" subtitle={done.token ? "Enter this token on your prepaid meter." : "Your electricity payment was completed."} back="/dashboard/services" />
        {done.token && (
          <div className="rounded-2xl border bg-[rgb(var(--bg-elevated))] p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">Meter token</p>
            <p className="mt-2 break-all font-display text-2xl font-bold tracking-widest">{done.token}</p>
            <button onClick={async () => { await navigator.clipboard.writeText(done.token!); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-500">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy token"}
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <Link href="/dashboard" className="flex-1 rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 py-3.5 text-center text-sm font-bold text-white">Back to home</Link>
          <Link href="/dashboard/history" className="flex-1 rounded-full border py-3.5 text-center text-sm font-semibold">View transactions</Link>
        </div>
      </div>
    );
  }

  const label = "text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]";
  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <SubPageHeader title="Pay Electricity" subtitle="Prepaid and postpaid bills, paid instantly" />
      <div className="space-y-3">
        <p className={label}>Distribution company</p>
        {providers.loading ? <p className="text-sm text-[rgb(var(--fg-muted))]">Loading…</p>
          : providers.error ? <p className="text-sm text-red-500">Couldn&apos;t load providers. <button type="button" onClick={providers.refresh} className="font-bold underline">Retry</button></p>
          : <NetworkPicker providers={providers.data ?? []} value={provider} onChange={(id) => { setProvider(id); invalidate(); }} />}
        {errors.providerId && <p className="text-xs text-red-500">{errors.providerId}</p>}
      </div>

      <div className="space-y-3">
        <p className={label}>Meter type</p>
        <div role="radiogroup" aria-label="Meter type" className="grid grid-cols-2 gap-3">
          {METER_TYPES.map((m) => (
            <button key={m.id} type="button" role="radio" aria-checked={meterType === m.id} onClick={() => { setMeterType(m.id); invalidate(); }}
              className={cn("rounded-full border py-3 text-sm font-semibold", meterType === m.id ? "border-brand-500 bg-brand-500/10 text-brand-500" : "bg-[rgb(var(--bg-elevated))] text-[rgb(var(--fg-muted))]")}>{m.label}</button>
          ))}
        </div>
      </div>

      <div>
        <FormField label="Meter number" icon={Zap} inputMode="numeric" maxLength={13} placeholder="Enter your meter number" value={meterNumber}
          onChange={(e) => { setMeterNumber(e.target.value.replace(/\D/g, "")); invalidate(); }} error={errors.meterNumber} />
        <button type="button" onClick={onVerify} disabled={verifying} className="mt-2 text-sm font-bold text-brand-500">
          {verifying ? "Verifying…" : customer ? "Verified ✓" : "Verify meter"}
        </button>
        {customer && (
          <div role="status" className="mt-2 text-sm">
            <p className="font-semibold text-emerald-500">Customer: {customer.customerName}</p>
            {customer.address && <p className="text-[rgb(var(--fg-muted))]">{customer.address}</p>}
          </div>
        )}
      </div>

      {customer && <AmountField value={amount} onChange={setAmount} quickAmounts={QUICK_AMOUNTS} error={errors.amount} />}
      {errors.form && <p role="alert" className="text-center text-sm text-red-500">{errors.form}</p>}
      {customer && <SubmitButton loading={loading}>Continue</SubmitButton>}
    </form>
  );
}
