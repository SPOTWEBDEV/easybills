import Link from "next/link";
import { ArrowRight, GraduationCap, LightbulbIcon, Smartphone, Tv } from "lucide-react";
import { StaticPageShell } from "@/components/layout/static-page-shell";

export const metadata = { title: "Services — EasyBills" };

const SERVICES = [
  {
    icon: Smartphone,
    name: "Airtime & Data",
    desc: "Top up any network in seconds — SME, gifting, and direct data plans across MTN, Airtel, Glo and 9mobile.",
    href: "/services/airtime",
  },
  {
    icon: LightbulbIcon,
    name: "Electricity",
    desc: "Prepaid and postpaid tokens for every major disco, with the customer's name confirmed before you pay.",
    href: "/services/electricity",
  },
  {
    icon: Tv,
    name: "Cable TV",
    desc: "Renew DStv, GOtv and StarTimes bouquets without leaving the app — smartcard confirmation included.",
    href: null,
  },
  {
    icon: GraduationCap,
    name: "WAEC & JAMB pins",
    desc: "Result checker and registration pins, always in stock and delivered instantly after purchase.",
    href: null,
  },
];

export default function ServicesPage() {
  return (
    <StaticPageShell
      eyebrow="Services"
      title="Everything you can pay for on EasyBills"
      description="One wallet, every bill. Here's what's available today."
      narrow={false}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SERVICES.map((s) => {
          const Card = (
            <div className="group h-full rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-brand-500/40">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-base font-semibold text-ink">{s.name}</h3>
              <p className="mt-1.5 text-sm text-ink-faint">{s.desc}</p>
              {s.href && (
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </div>
          );
          return s.href ? (
            <Link key={s.name} href={s.href}>
              {Card}
            </Link>
          ) : (
            <div key={s.name}>{Card}</div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-surface/60 p-6 text-center">
        <p className="text-sm text-ink-muted">
          Wallet funding is handled securely through Paystack — fund once, pay for anything above.
        </p>
      </div>
    </StaticPageShell>
  );
}
