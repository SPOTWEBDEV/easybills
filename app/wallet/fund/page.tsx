"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Landmark, CreditCard, Wallet2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { fundWalletSchema, FundWalletInput } from "@/lib/validators/schemas";
import { useInitializeFunding } from "@/hooks/use-wallet";
import { formatNaira, cn } from "@/lib/utils";

const methods = [
  { id: "bank_transfer", label: "Bank Transfer", icon: Landmark },
  { id: "card", label: "Debit Card", icon: CreditCard },
  { id: "virtual_account", label: "Virtual Account", icon: Wallet2 },
] as const;

const presetAmounts = [1000, 2000, 5000, 10000];

export default function FundWalletPage() {
  const [confirming, setConfirming] = useState(false);
  const initializeFunding = useInitializeFunding();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FundWalletInput>({
    resolver: zodResolver(fundWalletSchema),
    defaultValues: { method: "card", amount: 0 },
  });

  const values = watch();

  const onConfirm = async () => {
    try {
      const res = await initializeFunding.mutateAsync(values.amount);
      // Redirect the browser to Paystack's hosted checkout. The wallet is
      // credited by the backend once Paystack's webhook confirms payment —
      // see /wallet/fund/callback for what happens after the user pays.
      window.location.href = res.authorizationUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start payment. Please try again.");
      setConfirming(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Fund Wallet" subtitle="Top up your EasyBills balance" />

      <form
        onSubmit={handleSubmit(() => setConfirming(true))}
        className="space-y-6 px-5 pt-2"
      >
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            placeholder="0.00"
            leftIcon={<span className="text-sm font-semibold">₦</span>}
            {...register("amount")}
          />
          {errors.amount && <p className="text-xs text-coral-500">{errors.amount.message}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setValue("amount", amt, { shouldValidate: true })}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  values.amount === amt
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 dark:border-ink-700"
                )}
              >
                {formatNaira(amt, { compact: true })}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Preferred payment channel</Label>
          <Controller
            control={control}
            name="method"
            render={({ field }) => (
              <div className="space-y-2.5">
                {methods.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => field.onChange(m.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                      field.value === m.id
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                        : "border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-850"
                    )}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800">
                      <m.icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold">{m.label}</span>
                  </button>
                ))}
              </div>
            )}
          />
          <p className="flex items-start gap-1.5 pt-1 text-xs text-ink-500 dark:text-paper-200/40">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Payment is completed on Paystack&apos;s secure checkout — you can switch channels there too.
          </p>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Continue
        </Button>
      </form>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm funding</DialogTitle>
            <DialogDescription>You&apos;ll be redirected to Paystack to complete payment.</DialogDescription>
          </DialogHeader>
          <Card className="space-y-3 border-0 bg-ink-50 dark:bg-ink-900 p-4 shadow-none">
            <div className="flex justify-between text-sm">
              <span className="text-ink-600 dark:text-paper-200/60">Amount</span>
              <span className="font-semibold">{formatNaira(values.amount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600 dark:text-paper-200/60">Channel</span>
              <span className="font-semibold">{methods.find((m) => m.id === values.method)?.label}</span>
            </div>
          </Card>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button className="flex-1" loading={initializeFunding.isPending} onClick={onConfirm}>
              Proceed to payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
