"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { NetworkPicker } from "@/components/dashboard/network-picker";
import { AmountField } from "@/components/dashboard/amount-field";
import { FormField, SubmitButton } from "@/components/dashboard/form-field";
import { usePinPrompt } from "@/components/dashboard/pin-prompt-context";
import { useApiData } from "@/hooks/use-api-data";
import { airtimeApi } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { purchaseWithPinRetry } from "@/lib/purchase-with-pin-retry";
import { airtimeSchema } from "@/lib/validators/schemas";

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000].map((v) => ({ label: `₦${v.toLocaleString()}`, value: v }));

export default function BuyAirtimePage() {
  const router = useRouter();
  const { requestPin } = usePinPrompt();
  const providers = useApiData(() => airtimeApi.providers());
  const [network, setNetwork] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = airtimeSchema.safeParse({ providerId: network ?? "", phone: phone.trim(), amount });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] ??= i.message;
      return setErrors(next);
    }
    setErrors({}); setLoading(true);
    try {
      const { providerId, phone: p, amount: a } = parsed.data;
      const result = await purchaseWithPinRetry((pin) => airtimeApi.purchase({ providerId, phone: p, amount: a, transactionPin: pin }), requestPin);
      if (result === null) return; // cancelled at the PIN prompt
      router.replace("/dashboard/payment-status?status=success");
    } catch (err) {
      setErrors({ form: err instanceof ApiError ? err.message : "Something went wrong. Please try again." });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <SubPageHeader title="Buy Airtime" subtitle="Top up any Nigerian network instantly" />
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">Network</p>
        {providers.loading ? <p className="text-sm text-[rgb(var(--fg-muted))]">Loading networks…</p>
          : providers.error ? <p className="text-sm text-red-500">Couldn&apos;t load networks. <button type="button" onClick={providers.refresh} className="font-bold underline">Retry</button></p>
          : <NetworkPicker providers={providers.data ?? []} value={network} onChange={setNetwork} />}
        {errors.providerId && <p className="text-xs text-red-500">{errors.providerId}</p>}
      </div>
      <FormField label="Phone number" icon={Phone} type="tel" inputMode="numeric" maxLength={11} placeholder="08034567890" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
      <AmountField value={amount} onChange={setAmount} quickAmounts={QUICK_AMOUNTS} error={errors.amount} />
      {errors.form && <p className="text-center text-sm text-red-500">{errors.form}</p>}
      <SubmitButton loading={loading}>Continue</SubmitButton>
    </form>
  );
}
