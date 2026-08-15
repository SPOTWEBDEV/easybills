"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { withdrawSchema, WithdrawInput } from "@/lib/validators/schemas";
import { useWallet, useWithdraw } from "@/hooks/use-wallet";
import { formatNaira } from "@/lib/utils";

const banks = [
  "GTBank", "Access Bank", "Zenith Bank", "First Bank", "UBA",
  "Kuda Microfinance Bank", "Opay", "Moniepoint MFB", "Fidelity Bank",
];

export default function WithdrawPage() {
  const router = useRouter();
  const { data: wallet } = useWallet();
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const withdraw = useWithdraw();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<WithdrawInput>({ resolver: zodResolver(withdrawSchema) });

  const values = watch();

  const onConfirm = async () => {
    try {
      await withdraw.mutateAsync(values);
      setConfirming(false);
      setSuccess(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Withdrawal failed.");
      setConfirming(false);
    }
  };

  if (success) {
    return (
      <AppShell>
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-8 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10"
          >
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </motion.div>
          <h1 className="mt-6 font-display text-2xl font-bold">Withdrawal successful</h1>
          <p className="mt-2 text-sm text-ink-600 dark:text-paper-200/60">
            {formatNaira(values.amount)} is on its way to {values.bankName}.
          </p>
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
            <Button size="lg" onClick={() => router.push("/wallet")}>
              Back to wallet
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Withdraw" subtitle="Move money to your bank account" />

      <div className="px-5 pt-2 pb-4">
        <Card className="p-4">
          <p className="text-xs text-ink-600 dark:text-paper-200/60">Available balance</p>
          <p className="font-display text-xl font-bold">{formatNaira(wallet?.balance ?? 0)}</p>
        </Card>
      </div>

      <form onSubmit={handleSubmit(() => setConfirming(true))} className="space-y-5 px-5">
        <div className="space-y-1.5">
          <Label>Amount</Label>
          <Input
            type="number"
            placeholder="0.00"
            leftIcon={<span className="text-sm font-semibold">₦</span>}
            {...register("amount")}
          />
          {errors.amount && <p className="text-xs text-coral-500">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Bank</Label>
          <Controller
            control={control}
            name="bankName"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.bankName && <p className="text-xs text-coral-500">{errors.bankName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Account number</Label>
          <Input placeholder="0123456789" {...register("accountNumber")} />
          {errors.accountNumber && (
            <p className="text-xs text-coral-500">{errors.accountNumber.message}</p>
          )}
        </div>

        <p className="text-xs text-ink-500 dark:text-paper-200/40">A flat fee of ₦25 applies to withdrawals.</p>

        <Button type="submit" size="lg" className="w-full">
          Continue
        </Button>
      </form>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm withdrawal</DialogTitle>
            <DialogDescription>Double-check before we send this out.</DialogDescription>
          </DialogHeader>
          <Card className="space-y-3 border-0 bg-ink-50 dark:bg-ink-900 p-4 shadow-none">
            <div className="flex justify-between text-sm">
              <span className="text-ink-600 dark:text-paper-200/60">Amount</span>
              <span className="font-semibold">{formatNaira(values.amount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600 dark:text-paper-200/60">Bank</span>
              <span className="font-semibold">{values.bankName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600 dark:text-paper-200/60">Account</span>
              <span className="font-semibold">{values.accountNumber}</span>
            </div>
          </Card>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button className="flex-1" loading={withdraw.isPending} onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
