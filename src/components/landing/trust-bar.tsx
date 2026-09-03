import { Section } from "@/components/shared/section";

const stats = [
  { value: "2.4M+", label: "Transactions processed" },
  { value: "180K+", label: "Active users" },
  { value: "99.8%", label: "Success rate" },
  { value: "<5s", label: "Average delivery time" },
];

export function TrustBar() {
  return (
    <Section className="pb-16">
      <div className="grid grid-cols-2 gap-6 rounded-3xl border border-ink-200/60 dark:border-ink-700/60 bg-white dark:bg-ink-850 px-6 py-8 shadow-soft md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-2xl font-bold text-brand-600 dark:text-brand-400 md:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-ink-600 dark:text-paper-200/50 md:text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
