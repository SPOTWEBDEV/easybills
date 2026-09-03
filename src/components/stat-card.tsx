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
    brand: "bg-brand-500/15 text-brand-400",
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-ink-faint">{label}</p>
        <span className={cx("flex h-9 w-9 items-center justify-center rounded-full", toneClasses[tone])}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <p className="font-display text-3xl font-bold tracking-tight text-ink">{value}</p>
    </div>
  );
}
