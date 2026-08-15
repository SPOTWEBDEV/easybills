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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { dataPurchaseSchema, DataPurchaseInput } from "@/lib/validators/schemas";
import { useNetworkProviders, useDataPlans, usePurchaseData } from "@/hooks/use-services";
import { cn, formatNaira } from "@/lib/utils";
import { Transaction } from "@/lib/types";

export default function DataPage() {
  const router = useRouter();
  const { data: providers } = useNetworkProviders();
  const purchase = usePurchaseData();
  const [confirming, setConfirming] = useState(false);
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<DataPurchaseInput>({ resolver: zodResolver(dataPurchaseSchema) });

  const values = watch();
  const { data: plans, isLoading: plansLoading } = useDataPlans(values.providerId);
  const selectedProvider = providers?.find((p) => p.id === values.providerId);
  const selectedPlan = plans?.find((p) => p.id === values.planId);

  const onConfirm = async () => {
    try {
      const res = await purchase.mutateAsync(values);
      setConfirming(false);
      setReceipt(res.transaction);
      toast.success("Data purchase successful");
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
            <Button className="flex-1" onClick={() => router.push("/services/data")}>
              Buy again
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Buy Data" subtitle="Affordable bundles for every network" />

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
                    onClick={() => {
                      field.onChange(p.id);
                      setValue("planId", "");
                    }}
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
          <Label>Select a plan</Label>
          {!values.providerId ? (
            <p className="rounded-2xl border border-dashed border-ink-200 dark:border-ink-700 px-4 py-6 text-center text-xs text-ink-500 dark:text-paper-200/40">
              Choose a network to see available plans
            </p>
          ) : plansLoading ? (
            <div className="grid grid-cols-2 gap-2.5">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <Controller
              control={control}
              name="planId"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2.5">
                  {plans?.map((plan) => (
                    <button
                      type="button"
                      key={plan.id}
                      onClick={() => field.onChange(plan.id)}
                      className={cn(
                        "flex flex-col items-start rounded-2xl border px-3.5 py-3 text-left transition-colors",
                        field.value === plan.id
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                          : "border-ink-200 dark:border-ink-700"
                      )}
                    >
                      <span className="text-sm font-bold">{plan.size}</span>
                      <span className="text-[11px] text-ink-500 dark:text-paper-200/40">{plan.validity}</span>
                      <span className="mt-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
                        {formatNaira(plan.price)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            />
          )}
          {errors.planId && <p className="text-xs text-coral-500">{errors.planId.message}</p>}
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
              <span className="text-ink-600 dark:text-paper-200/60">Plan</span>
              <span className="font-semibold">{selectedPlan?.label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600 dark:text-paper-200/60">Phone number</span>
              <span className="font-semibold">{values.phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600 dark:text-paper-200/60">Amount</span>
              <span className="font-semibold">{formatNaira(selectedPlan?.price ?? 0)}</span>
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
