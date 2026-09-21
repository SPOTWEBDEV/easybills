import Link from "next/link";
import { AlertTriangle, Mail, MessageCircle } from "lucide-react";
import { StaticPageShell } from "@/components/layout/static-page-shell";

export const metadata = { title: "Help Center — EasyBills" };

const TOPICS = [
  {
    q: "A purchase didn't go through, where's my money?",
    a: "If a purchase fails on the provider's side, your wallet is refunded automatically — check your transaction history in the app first, it usually reflects within a minute.",
  },
  {
    q: "I funded my wallet but the balance hasn't updated",
    a: "Funding is confirmed by Paystack and can take a few seconds to reflect. Pull to refresh your wallet screen; if it's been more than a few minutes, contact us with your reference.",
  },
  {
    q: "I forgot my transaction PIN",
    a: "You can reset it from Settings inside the app once you've verified your account password.",
  },
  {
    q: "How do I report a wrong meter number or smartcard purchase?",
    a: "Reach out with your transaction reference below — the lookup step is designed to prevent this, but we're glad to look into it.",
  },
];

export default function SupportPage() {
  return (
    <StaticPageShell
      eyebrow="Support"
      title="How can we help?"
      description="Quick answers to the most common questions — and how to reach us for anything else."
      narrow={false}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {TOPICS.map((t) => (
              <div key={t.q} className="px-6 py-5">
                <p className="font-display text-sm font-semibold text-ink">{t.q}</p>
                <p className="mt-1.5 text-sm text-ink-muted">{t.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-faint">
            More questions? See the full{" "}
            <Link href="/#faq" className="font-medium text-brand-600 hover:underline">
              FAQ
            </Link>
            .
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
              <MessageCircle className="h-5 w-5" />
            </span>
            <h3 className="font-display text-sm font-semibold text-ink">In-app support</h3>
            <p className="mt-1.5 text-sm text-ink-faint">
              The fastest way to reach us — open the chat bubble from any screen in the app.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
              <Mail className="h-5 w-5" />
            </span>
            <h3 className="font-display text-sm font-semibold text-ink">Email us</h3>
            <p className="mt-1.5 text-sm text-ink-faint">
              Prefer email?{" "}
              <Link href="/contact" className="font-medium text-brand-600 hover:underline">
                Contact us
              </Link>{" "}
              and include your transaction reference if it's about a specific purchase.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h3 className="font-display text-sm font-semibold text-ink">Report an issue</h3>
            <p className="mt-1.5 text-sm text-ink-faint">
              Something not working right? Let us know what happened and, if you have one, the
              transaction reference — it helps us track it down fast.
            </p>
          </div>
        </div>
      </div>
    </StaticPageShell>
  );
}
