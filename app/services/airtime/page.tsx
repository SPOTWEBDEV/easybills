"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Receipt } from "@/components/shared/receipt";
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
import { airtimeSchema, AirtimeInput } from "@/lib/validators/schemas";
import { useNetworkProviders, usePurchaseAirtime } from "@/hooks/use-services";
import { cn, formatNaira } from "@/lib/utils";
import { Transaction } from "@/lib/types";

const presetAmounts = [100, 200, 500, 1000, 2000, 5000];

export default function AirtimePage() {
  const router = useRouter();
  const { data: providers } = useNetworkProviders();
  const purchase = usePurchaseAirtime();
  const [confirming, setConfirming] = useState(false);
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<AirtimeInput>({ resolver: zodResolver(airtimeSchema), defaultValues: { amount: 0 } });

  const values = watch();
  const selectedProvider = providers?.find((p) => p.id === values.providerId);

  const onConfirm = async () => {
    try {
      const res = await purchase.mutateAsync(values);
      setConfirming(false);
      setReceipt(res.transaction);
      toast.success("Airtime purchase successful");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Purchase failed.");
      setConfirming(false);
    }
  };

  if (receipt) {
    return (
      <AppShell>
        <PageHeader title="Receipt" />
        <div className="px-5 pt-4">
          <Receipt transaction={receipt} />
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button className="flex-1" onClick={() => router.push("/services/airtime")}>
              Buy again
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Buy Airtime" subtitle="Top up any Nigerian network instantly" />

      <form onSubmit={handleSubmit(() => setConfirming(true))} className="space-y-6 px-5 pt-2">
        <div className="space-y-2">
          <Label>Network</Label>
          <Controller
            control={control}
            name="providerId"
            render={({ field }) => (
              <div className="grid grid-cols-4 gap-2.5">
                {providers?.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => field.onChange(p.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border py-3.5 transition-colors",
                      field.value === p.id
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                        : "border-ink-200 dark:border-ink-700"
                    )}
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.logoInitial}
                    </span>
                    <span className="text-[11px] font-semibold">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          />
          {errors.providerId && <p className="text-xs text-coral-500">{errors.providerId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Phone number</Label>
          <Input
            placeholder="08034567890"
            leftIcon={<Phone className="h-4 w-4" />}
            {...register("phone")}
          />
          {errors.phone && <p className="text-xs text-coral-500">{errors.phone.message}</p>}
        </div>

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
                {formatNaira(amt)}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Continue
        </Button>
      </form>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm purchase</DialogTitle>
            <DialogDescription>Review before you pay.</DialogDescription>
          </DialogHeader>
          <Card className="space-y-3 border-0 bg-ink-50 dark:bg-ink-900 p-4 shadow-none">
            <div className="flex justify-between text-sm">
              <span className="text-ink-600 dark:text-paper-200/60">Network</span>
              <span className="font-semibold">{selectedProvider?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600 dark:text-paper-200/60">Phone number</span>
              <span className="font-semibold">{values.phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600 dark:text-paper-200/60">Amount</span>
              <span className="font-semibold">{formatNaira(values.amount || 0)}</span>
            </div>
          </Card>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button className="flex-1" loading={purchase.isPending} onClick={onConfirm}>
              Pay now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
