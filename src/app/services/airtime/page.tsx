import Link from "next/link";
import { ArrowRight, CheckCircle2, Smartphone, Wifi } from "lucide-react";
import { StaticPageShell } from "@/components/layout/static-page-shell";

export const metadata = { title: "Airtime & Data — EasyBills" };

const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile"];

const POINTS = [
  "SME, gifting, and direct data plans — pick whichever fits your budget",
  "Instant delivery, most purchases complete in a few seconds",
  "Automatic wallet refund if a purchase fails on the network's end",
  "Every purchase gets a receipt you can find later in your transaction history",
];

export default function AirtimeServicePage() {
  return (
    <StaticPageShell
      eyebrow="Services · Airtime & Data"
      title="Airtime and data, without the USSD codes"
      description="Top up any Nigerian network in a few taps, at rates that beat dialing *code#."
    >
      <div className="mb-8 flex flex-wrap gap-2">
        {NETWORKS.map((n) => (
          <span
            key={n}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted"
          >
            {n}
          </span>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
            <Smartphone className="h-5 w-5" />
          </span>
          <h3 className="font-display text-base font-semibold text-ink">Airtime</h3>
          <p className="mt-1.5 text-sm text-ink-faint">
            Recharge your own line or someone else's — pick a network, enter the number and
            amount, confirm with your PIN.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
            <Wifi className="h-5 w-5" />
          </span>
          <h3 className="font-display text-base font-semibold text-ink">Data</h3>
          <p className="mt-1.5 text-sm text-ink-faint">
            Browse available plans by network and pick the size and validity that suits you —
            from quick top-ups to monthly bundles.
          </p>
        </div>
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
