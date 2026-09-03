const STATS: [string, string][] = [
  ["50k+", "Bills paid monthly"],
  ["4s", "Average delivery time"],
  ["99.9%", "Uptime on core services"],
  ["24/7", "In-app support"],
];

export function TrustBar() {
  return (
    <section className="border-y border-line bg-surface/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-10 sm:grid-cols-4">
        {STATS.map(([value, label]) => (
          <div key={label} className="text-center sm:text-left">
            <p className="font-display text-2xl font-bold text-ink">{value}</p>
            <p className="mt-1 text-xs text-ink-faint">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
