import { ArrowRight, CheckCircle2, ShieldCheck, Smartphone, Wifi, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 78% 30%, rgba(14,168,148,0.14) 0%, rgba(14,168,148,0) 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Instant delivery on every bill, every time
          </span>

          <h1 className="font-display text-balance text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Pay every bill, <span className="text-brand-500">buy every card</span>, in one tap.
          </h1>

          <p className="mt-5 max-w-md text-balance text-ink-muted">
            Airtime, data, electricity, cable TV, WAEC &amp; JAMB pins and more — EasyBills gets it
            done in seconds, at the best rates, with receipts you can trust.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#download"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-paper-50 transition-colors hover:bg-brand-600"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#services"
              className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface"
            >
              Explore services
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-ink-faint">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-500" />
              Bank-level security
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-brand-500" />
              Avg. 4s delivery
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -right-3 -top-6 z-10 flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card sm:-right-8">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-good/15 text-good">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-ink">Payment successful</p>
              <p className="text-[11px] text-ink-faint">Just now</p>
            </div>
          </div>

          {/* Wallet balance card — styled like a physical recharge/scratch
              card, echoing what EasyBills actually sells. */}
          <div
            className="notch-card overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-glow"
            style={{ ["--notch-y" as string]: "58%" }}
          >
            <div className="absolute inset-0 -z-10 scratch-shimmer opacity-40" />
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              Wallet balance
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-ink">₦84,250.75</p>
            <p className="mt-1 font-mono text-sm text-ink-faint">Cashback: ₦1,320.50</p>

            <div className="notch-perf" />

            <div className="mt-8 flex gap-3">
              <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-base py-2.5 text-sm text-ink-muted">
                <Smartphone className="h-4 w-4" />
                Airtime
              </div>
              <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-base py-2.5 text-sm text-ink-muted">
                <Wifi className="h-4 w-4" />
                Data
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
