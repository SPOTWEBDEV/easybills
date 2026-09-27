"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
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
import { TransactionPinDialog } from "@/components/shared/transaction-pin-dialog";
import { fundWalletSchema, FundWalletInput } from "@/lib/validators/schemas";
import { useInitializeFunding } from "@/hooks/use-wallet";
import { formatNaira, cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";

const presetAmounts = [1000, 2000, 5000, 10000];

export default function FundWalletPage() {
  const [confirming, setConfirming] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const initializeFunding = useInitializeFunding();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FundWalletInput>({
    resolver: zodResolver(fundWalletSchema),
    defaultValues: { amount: 0 },
  });

  const values = watch();

  const startFunding = async (transactionPin?: string) => {
    try {
      const res = await initializeFunding.mutateAsync({ amount: values.amount, transactionPin });
      setPinDialogOpen(false);
      window.location.href = res.authorizationUrl;
    } catch (err) {
      if (err instanceof ApiError && err.payload && typeof err.payload === "object" && "requiresPin" in err.payload) {
        setConfirming(false);
        setPinDialogOpen(true);
        return;
      }
      toast.error(err instanceof Error ? err.message : "Could not start payment. Please try again.");
      setConfirming(false);
      setPinDialogOpen(false);
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

        <p className="flex items-start gap-1.5 text-xs text-ink-500 dark:text-paper-200/40">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          You&apos;ll choose how to pay — card, bank transfer, or USSD — on Paystack&apos;s secure checkout in the next step.
        </p>

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
          </Card>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button className="flex-1" loading={initializeFunding.isPending} onClick={() => startFunding()}>
              Proceed to payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TransactionPinDialog
        open={pinDialogOpen}
        onOpenChange={setPinDialogOpen}
        onConfirm={(pin) => startFunding(pin)}
        loading={initializeFunding.isPending}
      />
    </AppShell>
  );
}