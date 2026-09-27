"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { transactionsApi } from "@/lib/api/transactions";
import { Transaction } from "@/lib/types";

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 12; // ~30 seconds

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref");

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!reference) {
      setNotFound(true);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      const txn = await transactionsApi.getById(reference);
      if (cancelled) return;

      if (txn && txn.status !== "pending") {
        setTransaction(txn);
        return;
      }
      if (txn) setTransaction(txn);

      setAttempts((prev) => {
        const next = prev + 1;
        if (next < MAX_POLLS) {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
        return next;
      });
    };

    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  if (notFound) {
    return (
      <StatusScreen
        icon={XCircle}
        color="text-coral-500 bg-coral-50 dark:bg-coral-500/10"
        title="Missing payment reference"
        body="We couldn't find a payment reference in the URL. If you completed a payment, check your transaction history."
        primaryLabel="View transactions"
        onPrimary={() => router.push("/transactions")}
      />
    );
  }

  if (transaction?.status === "success") {
    return (
      <StatusScreen
        icon={CheckCircle2}
        color="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
        title="Wallet funded!"
        body="Your payment was confirmed and your wallet has been credited."
        primaryLabel="Back to wallet"
        onPrimary={() => router.push("/wallet")}
      />
    );
  }

  if (transaction?.status === "failed") {
    return (
      <StatusScreen
        icon={XCircle}
        color="text-coral-500 bg-coral-50 dark:bg-coral-500/10"
        title="Payment did not go through"
        body="Your payment was not successful. No funds were added to your wallet."
        primaryLabel="Try again"
        onPrimary={() => router.push("/wallet/fund")}
      />
    );
  }

  if (attempts >= MAX_POLLS) {
    return (
      <StatusScreen
        icon={Clock}
        color="text-brand-500 bg-brand-50 dark:bg-brand-500/10"
        title="Still processing"
        body="Your payment is taking a little longer to confirm than usual. It'll reflect in your wallet as soon as it's done — check your transaction history in a moment."
        primaryLabel="View transactions"
        onPrimary={() => router.push("/transactions")}
      />
    );
  }

  return (
    <StatusScreen
      icon={Clock}
      color="text-brand-500 bg-brand-50 dark:bg-brand-500/10"
      title="Confirming your payment..."
      body="This usually takes just a few seconds."
      spinning
    />
  );
}

function StatusScreen({
  icon: Icon,
  color,
  title,
  body,
  primaryLabel,
  onPrimary,
  spinning,
}: {
  icon: React.ElementType;
  color: string;
  title: string;
  body: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  spinning?: boolean;
}) {
  return (
    <AppShell>
      <PageHeader title="Payment status" />
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: spinning ? 360 : 0 }}
          transition={
            spinning
              ? { rotate: { duration: 1.4, repeat: Infinity, ease: "linear" } }
              : { type: "spring", stiffness: 200, damping: 14 }
          }
          className={`flex h-20 w-20 items-center justify-center rounded-full ${color}`}
        >
          <Icon className="h-10 w-10" />
        </motion.div>
        <h1 className="mt-6 font-display text-2xl font-bold">{title}</h1>
        <p className="mt-2 max-w-xs text-sm text-ink-600 dark:text-paper-200/60">{body}</p>
        {primaryLabel && onPrimary && (
          <div className="mt-8 w-full max-w-xs">
            <Button size="lg" className="w-full" onClick={onPrimary}>
              {primaryLabel}
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function PaystackCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}
