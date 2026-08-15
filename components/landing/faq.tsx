"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Section } from "@/components/shared/section";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How fast are payments delivered?",
    a: "Most airtime and data purchases complete in under 5 seconds. Electricity, cable and exam pins typically complete within 30 seconds, depending on the provider.",
  },
  {
    q: "Is my money safe in my EasyBills wallet?",
    a: "Yes. Wallets are held with a licensed banking partner, protected by PIN and optional 2FA, and every transaction is logged with a receipt you can download or share.",
  },
  {
    q: "What happens if a transaction fails?",
    a: "We automatically retry failed transactions. If it still fails, the full amount is refunded to your wallet instantly — no support ticket required.",
  },
  {
    q: "Can I install EasyBills like an app?",
    a: "Yes — EasyBills is a full Progressive Web App. Add it to your home screen on Android or iPhone for a native app experience, including offline access.",
  },
  {
    q: "How do agent profit margins work?",
    a: "Agents set their own selling price above our wholesale rate. The markup is credited to your wallet the moment a customer completes a purchase.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" className="py-16 md:py-24">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Frequently asked questions
        </h2>
      </div>

      <div className="mx-auto mt-10 max-w-2xl divide-y divide-ink-200 dark:divide-ink-700 rounded-3xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 shadow-soft">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={faq.q} className="px-5 md:px-6">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-sm font-semibold md:text-base">{faq.q}</span>
                <Plus
                  className={cn(
                    "h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400 transition-transform duration-300",
                    isOpen && "rotate-45"
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm text-ink-600 dark:text-paper-200/60">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
