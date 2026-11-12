import { cn } from "@/lib/utils";

export function AmountField({
  value, onChange, quickAmounts, error,
}: { value: string; onChange: (v: string) => void; quickAmounts: { label: string; value: number }[]; error?: string }) {
  return (
    <div className="space-y-3">
      <label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">Amount</label>
      <div className={cn("flex items-center gap-2 rounded-full border bg-[rgb(var(--bg-elevated))] px-5 py-3.5 focus-within:border-brand-500", error && "border-red-500")}>
        <span className="font-display text-lg font-bold text-[rgb(var(--fg-muted))]">₦</span>
        <input id="amount" inputMode="numeric" placeholder="0" value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
          className="w-full bg-transparent font-display text-lg font-bold outline-none" />
      </div>
      <div className="flex flex-wrap gap-2">
        {quickAmounts.map((q) => (
          <button key={q.value} type="button" onClick={() => onChange(String(q.value))}
            className={cn("rounded-full border px-4 py-2 text-sm font-semibold", value === String(q.value) ? "border-brand-500 bg-brand-500/10 text-brand-500" : "bg-[rgb(var(--bg-elevated))] text-[rgb(var(--fg-muted))]")}>
            {q.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
