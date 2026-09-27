"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Wallet, ShieldCheck, ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    icon: Smartphone,
    title: "Every bill, one app",
    body: "Airtime, data, electricity, cable TV, exam pins and more — pay for anything in a few taps.",
  },
  {
    icon: Wallet,
    title: "Fund once, spend anywhere",
    body: "Top up your wallet by bank transfer, card, or your dedicated virtual account, then buy instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Built to be trusted",
    body: "PIN-protected transactions, instant receipts, and automatic refunds if anything ever fails.",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const isLast = step === slides.length - 1;
  const slide = slides[step];

  return (
    <div className="flex min-h-screen flex-col justify-between bg-paper-50 dark:bg-ink-950 px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-12 flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-mesh text-white shadow-glow">
                <slide.icon className="h-9 w-9" />
              </span>
              <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">{slide.title}</h1>
              <p className="mt-3 max-w-xs text-sm text-ink-600 dark:text-paper-200/60">{slide.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-6 bg-brand-600" : "w-1.5 bg-ink-200 dark:bg-ink-700"
              )}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <Button
            size="lg"
            className="flex-1"
            onClick={() => (isLast ? router.push("/dashboard") : setStep((s) => s + 1))}
          >
            {isLast ? "Get started" : "Next"} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {!isLast && (
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 w-full text-center text-xs font-semibold text-ink-500 dark:text-paper-200/40"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
