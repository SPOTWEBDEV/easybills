import { ArrowRight, Percent, Users, Wallet } from "lucide-react";

const POINTS = [
  { icon: Users, text: "Sell to your community — no storefront needed" },
  { icon: Percent, text: "Earn commission on every sale, tracked live" },
  { icon: Wallet, text: "Withdraw earnings straight to your bank" },
];

export function AgentCta() {
  return (
    <section id="agent" className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid grid-cols-1 items-center gap-10 rounded-3xl border border-line bg-surface p-8 sm:p-12 md:grid-cols-2">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-base px-3 py-1.5 text-xs text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Become an Agent
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            Turn EasyBills into an income stream.
          </h2>
          <p className="mt-3 text-ink-muted">
            Sell airtime, data, electricity and cable subscriptions to your community and earn a
            commission on every sale, tracked in real time from your dashboard.
          </p>
          <a
            href="#download"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-paper-50 transition-colors hover:bg-brand-600"
          >
            Apply from the app
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <ul className="space-y-4">
          {POINTS.map((p) => (
            <li key={p.text} className="flex items-center gap-3 rounded-xl border border-line bg-base p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-500">
                <p.icon className="h-4 w-4" />
              </span>
              <span className="text-sm text-ink">{p.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
