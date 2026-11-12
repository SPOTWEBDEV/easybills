"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { walletApi } from "@/lib/api/dashboard";

type State = "checking" | "success" | "pending" | "failed";

// Entry points:
//  1. ?status=success|pending|failed[&title=&message=]  (after a purchase, same params as the app)
//  2. Paystack's return (?reference=…&trxref=…): poll the wallet until it's credited (~2s × 10, like the app).
function Status() {
  const params = useSearchParams();
  const explicit = params.get("status") as State | null;
  const fromPaystack = !explicit && (params.has("reference") || params.has("trxref"));
  const [state, setState] = useState<State>(explicit && ["success", "pending", "failed"].includes(explicit) ? explicit : fromPaystack ? "checking" : "success");

  useEffect(() => {
    if (!fromPaystack) return;
    let cancelled = false;
    (async () => {
      const before = Number(sessionStorage.getItem("eb:fund-before") ?? NaN);
      for (let i = 0; i < 10 && !cancelled; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        try {
          const w = await walletApi.get();
          if (Number.isNaN(before) || w.balance > before) { sessionStorage.removeItem("eb:fund-before"); return setState("success"); }
        } catch {}
      }
      if (!cancelled) setState("pending");
    })();
    return () => { cancelled = true; };
  }, [fromPaystack]);

  const funding = fromPaystack;
  const view = {
    checking: { icon: <Loader2 className="h-12 w-12 animate-spin text-brand-500" />, title: "Confirming your payment…", msg: "This usually takes a few seconds.", cta: "Back to home", href: "/dashboard" },
    success: { icon: <CheckCircle2 className="h-12 w-12 text-emerald-500" />, title: funding ? "Wallet funded!" : "Payment successful!", msg: funding ? "Your payment was confirmed and your wallet has been credited." : "Your payment was confirmed.", cta: "Back to home", href: "/dashboard" },
    pending: { icon: <Clock className="h-12 w-12 text-amber-500" />, title: funding ? "Payment received" : "Payment pending", msg: funding ? "We're still confirming your payment with Paystack. Your wallet will update shortly." : "We're confirming your payment. This can take a few minutes.", cta: "Back to home", href: "/dashboard" },
    failed: { icon: <XCircle className="h-12 w-12 text-red-500" />, title: "Payment failed", msg: "We couldn't confirm this payment. No funds were deducted.", cta: "Try again", href: "/dashboard/services" },
  }[state];

  return (
    <div role="status" className="flex flex-col items-center py-20 text-center">
      {view.icon}
      <h1 className="mt-6 font-display text-2xl font-bold">{params.get("title") || view.title}</h1>
      <p className="mt-2 max-w-sm text-[rgb(var(--fg-muted))]">{params.get("message") || view.msg}</p>
      <div className="mt-8 flex gap-3">
        <Link href={view.href} className="rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 px-6 py-3 text-sm font-bold text-white">{view.cta}</Link>
        <Link href="/dashboard/history" className="rounded-full border px-6 py-3 text-sm font-semibold">View transactions</Link>
      </div>
    </div>
  );
}
export default function PaymentStatusPage() { return <Suspense><Status /></Suspense>; }
