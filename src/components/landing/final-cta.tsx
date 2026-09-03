export function FinalCta() {
  return (
    <section id="download" className="mx-auto max-w-6xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-8 py-16 text-center shadow-card">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 80% at 50% 0%, rgba(14,168,148,0.14) 0%, rgba(14,168,148,0) 70%)",
          }}
        />
        <div className="relative">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Get the EasyBills app.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            Every bill in your pocket. Download EasyBills for iOS and Android and pay your first
            bill in under a minute.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-line bg-base px-6 py-3 text-sm font-semibold text-ink">
              Download on the App Store
            </span>
            <span className="rounded-full border border-line bg-base px-6 py-3 text-sm font-semibold text-ink">
              Get it on Google Play
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
