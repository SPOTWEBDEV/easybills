"use client";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { AmountField } from "@/components/dashboard/amount-field";
import { SubmitButton } from "@/components/dashboard/form-field";
import { usePinPrompt } from "@/components/dashboard/pin-prompt-context";
import { walletApi } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { purchaseWithPinRetry } from "@/lib/purchase-with-pin-retry";
import { fundWalletSchema } from "@/lib/validators/schemas";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000].map((v) => ({ label: `₦${v / 1000}K`, value: v }));

export default function FundWalletPage() {
  const { requestPin } = usePinPrompt();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = fundWalletSchema.safeParse({ amount });
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setError(undefined); setLoading(true);
    try {
      const before = await walletApi.get();
      // Remember the balance so /dashboard/payment-status can tell when Paystack's webhook has credited it.
      sessionStorage.setItem("eb:fund-before", String(before.balance));
      const init = await purchaseWithPinRetry(
        (pin) => walletApi.fundInitialize({ amount: parsed.data.amount, callbackUrl: `${window.location.origin}/dashboard/payment-status`, transactionPin: pin }),
        requestPin
      );
      if (init === null) return setLoading(false); // cancelled at the PIN prompt
      window.location.assign(init.authorizationUrl); // Paystack checkout, returns to payment-status
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <SubPageHeader title="Fund Wallet" subtitle="Top up your EasyBills balance" back="/dashboard" />
      <AmountField value={amount} onChange={setAmount} quickAmounts={QUICK_AMOUNTS} error={error} />
      <p className="mt-5 flex items-start gap-2 text-xs text-[rgb(var(--fg-muted))]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Payment is completed on Paystack&apos;s secure checkout.
      </p>
      <div className="mt-8"><SubmitButton loading={loading}>Continue to payment</SubmitButton></div>
    </form>
  );
}
