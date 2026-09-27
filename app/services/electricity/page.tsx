"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hash, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Receipt } from "@/components/shared/receipt";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { electricitySchema, ElectricityInput } from "@/lib/validators/schemas";
import { useElectricityProviders, useMeterLookup, usePurchaseElectricity } from "@/hooks/use-services";
import { formatNaira } from "@/lib/utils";
import { Transaction } from "@/lib/types";

const presetAmounts = [1000, 2000, 5000, 10000, 20000];

export default function ElectricityPage() {
  const router = useRouter();
  const { data: providers } = useElectricityProviders();
  const meterLookup = useMeterLookup();
  const purchase = usePurchaseElectricity();
  const [confirming, setConfirming] = useState(false);
  const [receipt, setReceipt] = useState<{ transaction: Transaction; token?: string } | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ElectricityInput>({
    resolver: zodResolver(electricitySchema),
    defaultValues: { meterType: "prepaid", amount: 0 },
  });

  const values = watch();
  const selectedProvider = providers?.find((p) => p.id === values.providerId);

  const handleLookup = async () => {
    if (!values.providerId || !values.meterNumber) {
      toast.error("Select a provider and enter a meter number first.");
      return;
    }
    try {
      const res = await meterLookup.mutateAsync({
        providerId: values.providerId,
        meterNumber: values.meterNumber,
        meterType: values.meterType,
      });
      setCustomerName(res.customerName);
      toast.success("Meter verified");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not verify meter.");
    }
  };

  const onConfirm = async () => {
    try {
      const res = await purchase.mutateAsync({ ...values, customerName: customerName ?? "" });
      setConfirming(false);
      setReceipt(res);
      toast.success("Electricity payment successful");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed.");
      setConfirming(false);
    }
  };

  if (receipt) {
    return (
      <AppShell>
        <PageHeader title="Receipt" />
        <div className="px-5 pt-4">
          <Receipt
            transaction={receipt.transaction}
            extra={
              receipt.token ? (
                <div className="flex items-center justify-between">
                  <span className="text-ink-500 dark:text-paper-200/40">Token</span>
                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                    {receipt.token}
                  </span>
                </div>
              ) : null
            }
          />
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button className="flex-1" onClick={() => router.push("/services/electricity")}>
              Pay again
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Pay Electricity" subtitle="Prepaid & postpaid, all DisCos" />

      <form onSubmit={handleSubmit(() => setConfirming(true))} className="space-y-6 px-5 pt-2">
        <div className="space-y-1.5">
          <Label>Distribution company</Label>
          <Controller
            control={control}
            name="providerId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your DisCo" />
                </SelectTrigger>
                <SelectContent>
                  {providers?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.providerId && <p className="text-xs text-coral-500">{errors.providerId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Meter type</Label>
          <Controller
            control={control}
            name="meterType"
            render={({ field }) => (
              <Tabs value={field.value} onValueChange={field.onChange}>
                <TabsList className="w-full">
                  <TabsTrigger value="prepaid" className="flex-1">Prepaid</TabsTrigger>
                  <TabsTrigger value="postpaid" className="flex-1">Postpaid</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Meter number</Label>
          <Input
            placeholder="04521178820"
            leftIcon={<Hash className="h-4 w-4" />}
            rightSlot={
              <button type="button" onClick={handleLookup} className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                {meterLookup.isPending ? "..." : "Verify"}
              </button>
            }
            {...register("meterNumber", {
              onChange: () => setCustomerName(null),
            })}
          />
          {errors.meterNumber && <p className="text-xs text-coral-500">{errors.meterNumber.message}</p>}
          {customerName && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-500">
              <Search className="h-3.5 w-3.5" /> {customerName}
            </p>
          )}
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
                className="rounded-full border border-ink-200 dark:border-ink-700 px-3.5 py-1.5 text-xs font-semibold transition-colors data-[active=true]:bg-brand-600"
              >
                {formatNaira(amt, { compact: true })}
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
            <DialogTitle>Confirm payment</DialogTitle>
            <DialogDescription>Review before you pay.</DialogDescription>
          </DialogHeader>
          <Card className="space-y-3 border-0 bg-ink-50 dark:bg-ink-900 p-4 shadow-none">
            <div className="flex justify-between text-sm">
              <span className="text-ink-600 dark:text-paper-200/60">DisCo</span>
              <span className="font-semibold">{selectedProvider?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600 dark:text-paper-200/60">Meter number</span>
              <span className="font-semibold">{values.meterNumber}</span>
            </div>
            {customerName && (
              <div className="flex justify-between text-sm">
                <span className="text-ink-600 dark:text-paper-200/60">Customer</span>
                <span className="font-semibold">{customerName}</span>
              </div>
            )}
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
