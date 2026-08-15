import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminStatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: number;
  icon?: LucideIcon;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-ink-500 dark:text-paper-200/40">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      {change !== undefined && (
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1 text-xs font-semibold",
            positive ? "text-emerald-600 dark:text-emerald-500" : "text-coral-600 dark:text-coral-500"
          )}
        >
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(change)}% vs last period
        </p>
      )}
    </Card>
  );
}
