import Link from "next/link";
import { ArrowRight, CheckCircle2, UserCheck } from "lucide-react";
import { StaticPageShell } from "@/components/layout/static-page-shell";

export const metadata = { title: "Electricity Bills — EasyBills" };

const POINTS = [
  "Prepaid tokens and postpaid payments for every major disco",
  "Meter number is verified and the customer's name shown before you pay — no more paying into the wrong meter",
  "Your prepaid token is shown right after purchase, and saved in your transaction history",
  "Automatic wallet refund if a purchase fails on the provider's end",
];

export default function ElectricityServicePage() {
  return (
    <StaticPageShell
      eyebrow="Services · Electricity"
      title="Electricity tokens, verified before you pay"
      description="Buy prepaid or postpaid electricity for any major disco — with the customer's name confirmed upfront, so you're never guessing whose meter you're funding."
    >
      <div className="mb-8 rounded-2xl border border-line bg-surface p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
            <UserCheck className="h-5 w-5" />
          </span>
          <h3 className="font-display text-base font-semibold text-ink">Meter lookup first</h3>
        </div>
        <p className="text-sm text-ink-faint">
          Enter the disco and meter number, and we confirm the customer's name and address before
          you commit to a purchase — a simple check that catches a mistyped meter number before it
          costs you anything.
        </p>
      </div>

      <ul className="mb-10 space-y-3">
        {POINTS.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm text-ink-muted">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            {p}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href="/#download"
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-paper-50 transition-colors hover:bg-brand-600"
        >
          Get the app
          <ArrowRight className="h-4 w-4" />
        </a>
        <Link
          href="/services"
          className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface"
        >
          See all services
        </Link>
      </div>
    </StaticPageShell>
  );
}
