const STEPS = [
  {
    title: "Create your account",
    desc: "Sign up on the EasyBills app with your name, email and phone number — active instantly, no waiting on OTPs.",
  },
  {
    title: "Fund your wallet",
    desc: "Add money with Paystack. Your balance updates the moment payment clears.",
  },
  {
    title: "Pay any bill",
    desc: "Pick a service, confirm with your transaction PIN, and it's delivered in seconds.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-line bg-surface/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            Three steps to your first bill.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title}>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-brand-500/40 font-display text-sm font-bold text-brand-500">
                {i + 1}
              </div>
              <h3 className="font-display text-base font-semibold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm text-ink-faint">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
