import { GraduationCap, LightbulbIcon, ShieldCheck, Smartphone, Tv, Wifi } from "lucide-react";

const SERVICES = [
  { icon: Smartphone, name: "Airtime", desc: "Top up any network in seconds, at the best rates on the market." },
  { icon: Wifi, name: "Data", desc: "SME, gifting, and direct data plans across MTN, Airtel, Glo and 9mobile." },
  { icon: LightbulbIcon, name: "Electricity", desc: "Prepaid and postpaid tokens for every major disco, delivered instantly." },
  { icon: Tv, name: "Cable TV", desc: "Renew DStv, GOtv and StarTimes without leaving the app." },
  { icon: GraduationCap, name: "WAEC & JAMB", desc: "Result checker and registration pins, always in stock." },
  { icon: ShieldCheck, name: "Fund wallet", desc: "Add money securely with Paystack — cards, transfer, or USSD." },
];

export function ServicesGrid() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto mb-14 max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
          Every bill, one wallet.
        </h2>
        <p className="mt-3 text-ink-muted">
          Stop juggling apps and USSD codes. EasyBills covers the essentials, at rates that beat
          your bank.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <div
            key={s.name}
            className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-brand-500/40"
          >
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500">
              <s.icon className="h-5 w-5" />
            </span>
            <h3 className="font-display text-base font-semibold text-ink">{s.name}</h3>
            <p className="mt-1.5 text-sm text-ink-faint">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
