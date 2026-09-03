import { CheckCircle2, Gift, RefreshCw, ShieldCheck, Sparkles, Tag } from "lucide-react";

const FEATURES = [
  {
    icon: Tag,
    title: "Transparent pricing",
    desc: "No subscriptions, no hidden charges. The fee is shown before you confirm, every time.",
  },
  {
    icon: RefreshCw,
    title: "Automatic refunds",
    desc: "If a purchase fails on the provider's end, your wallet is refunded automatically — no support ticket needed.",
  },
  {
    icon: Sparkles,
    title: "Cashback on every buy",
    desc: "Eligible purchases earn cashback straight into your wallet, redeemable on your next bill.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-level security",
    desc: "Your PIN and password never touch our logs. Funding goes through Paystack's secure checkout.",
  },
  {
    icon: Gift,
    title: "Refer & earn",
    desc: "Share your code — you and your friend both get rewarded the moment they complete their first purchase.",
  },
  {
    icon: CheckCircle2,
    title: "Instant confirmation",
    desc: "Every successful purchase comes with a receipt you can trust, ready to share or download.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto mb-14 max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
          Built to be trusted, not just fast.
        </h2>
        <p className="mt-3 text-ink-muted">
          The details that make EasyBills the last bills app you'll need to install.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-line bg-surface p-6">
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="font-display text-base font-semibold text-ink">{f.title}</h3>
            <p className="mt-1.5 text-sm text-ink-faint">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
