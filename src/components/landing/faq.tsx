"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/lib/utils";

const FAQS = [
  {
    q: "Is my money safe with EasyBills?",
    a: "Yes. Wallet funding goes through Paystack's secure checkout, and your transaction PIN and password are never stored in plain text or logged. We never store your card details on our servers.",
  },
  {
    q: "How fast is delivery on airtime, data, or electricity?",
    a: "Most purchases complete in a few seconds. In rare cases where a provider is slow to respond, you'll see a \"pending\" status until it clears — this doesn't happen often.",
  },
  {
    q: "What happens if a purchase fails?",
    a: "If a purchase fails on the provider's side, your wallet is automatically refunded — you don't need to open a support ticket or wait for manual review.",
  },
  {
    q: "Do you charge extra fees?",
    a: "Any fee is shown upfront before you confirm a purchase — there are no subscriptions and no hidden charges added afterward.",
  },
  {
    q: "How does the referral program work?",
    a: "Share your referral code with a friend. Once they sign up and complete their first successful purchase, you both get rewarded straight into your wallets.",
  },
  {
    q: "Can I become an agent and resell services?",
    a: "Yes — apply from the app to become an EasyBills agent, sell to your community, and earn a tracked commission on every sale.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <div className="mx-auto mb-12 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
          Frequently asked questions.
        </h2>
      </div>

      <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
        {FAQS.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={open}
              >
                <span className="font-display text-sm font-semibold text-ink">{item.q}</span>
                <ChevronDown
                  className={cx(
                    "h-4 w-4 shrink-0 text-ink-faint transition-transform",
                    open && "rotate-180 text-brand-500"
                  )}
                />
              </button>
              {open && (
                <div className="px-6 pb-5 text-sm text-ink-muted">{item.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
