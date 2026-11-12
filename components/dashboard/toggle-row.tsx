import { cn } from "@/lib/utils";

export function ToggleRow({ title, subtitle, value, onChange, disabled }: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {subtitle && <p className="text-xs text-[rgb(var(--fg-muted))]">{subtitle}</p>}
      </div>
      <button type="button" role="switch" aria-checked={value} aria-label={title} disabled={disabled} onClick={() => onChange(!value)}
        className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60", value ? "bg-brand-500" : "bg-ink-300 dark:bg-ink-700")}>
        <span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all", value ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}
