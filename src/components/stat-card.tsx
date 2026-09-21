import type { LucideIcon } from "lucide-react";
import { cx } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "good" | "bad" | "brand";
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-surface-hover text-ink-muted",
    good: "bg-good/15 text-good",
    bad: "bg-bad/15 text-bad",
    brand: "bg-brand-500/15 text-brand-600",
  };

  return (
    <div className="group rounded-2xl border border-line bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-ink-faint">{label}</p>
        <span
          className={cx(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
            toneClasses[tone]
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
      </div>
      <p className="font-display text-3xl font-bold tracking-tight text-ink">{value}</p>
    </div>
  );
}
