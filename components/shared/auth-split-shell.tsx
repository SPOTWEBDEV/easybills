import Link from "next/link";
import { ShieldCheck, Zap } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { NotchCard } from "@/components/shared/notch-card";
import { formatNaira } from "@/lib/utils";

export function AuthSplitShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left: brand / image panel — hidden on small screens */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-mesh p-10 text-white md:flex lg:p-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-10 h-64 w-64 rounded-full bg-brand-300/20 blur-3xl" />

        <Link href="/" className="relative z-10">
          <Logo inverted className="text-white" />
        </Link>

        <div className="relative z-10 max-w-sm">
          <h2 className="font-display text-3xl font-bold leading-tight lg:text-4xl">
            Every bill, every card, sorted in seconds.
          </h2>
          <p className="mt-4 text-sm text-white/70 lg:text-base">
            Join thousands of Nigerians who trust EasyBills for airtime, data, electricity and
            more — with instant delivery and receipts you can trust.
          </p>

          <div className="mt-8 flex items-center gap-6 text-xs text-white/60">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Bank-level security
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-brand-200" /> Avg. 4s delivery
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[260px]">
          <NotchCard perforateAt="70%" className="border border-white/10 bg-white/10 backdrop-blur-md">
            <div className="px-5 pt-5 pb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                Wallet balance
              </p>
              <p className="mt-1.5 font-display text-2xl font-bold">{formatNaira(84250.75)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 px-3 pb-4 pt-2">
              <div className="rounded-xl bg-white/10 px-2.5 py-2 text-center text-[11px] font-semibold">
                Airtime
              </div>
              <div className="rounded-xl bg-white/10 px-2.5 py-2 text-center text-[11px] font-semibold">
                Data
              </div>
            </div>
          </NotchCard>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex flex-col justify-center bg-paper-50 dark:bg-ink-950 px-6 py-10 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="flex justify-center md:hidden">
            <Logo />
          </Link>

          <div className="mt-8 text-center md:mt-0 md:text-left">
            <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-ink-600 dark:text-paper-200/60">{subtitle}</p>
          </div>

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-6 text-center text-sm md:text-left">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
