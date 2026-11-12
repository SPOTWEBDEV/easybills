import { Check } from "lucide-react";
import type { Provider } from "@/lib/api/dashboard";
import { cn } from "@/lib/utils";

export function NetworkPicker({ providers, value, onChange }: { providers: Provider[]; value: string | null; onChange: (id: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Network" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {providers.map((p) => {
        const active = value === p.id;
        return (
          <button key={p.id} type="button" role="radio" aria-checked={active} onClick={() => onChange(p.id)}
            className={cn("relative flex flex-col items-center gap-2 rounded-2xl border bg-[rgb(var(--bg-elevated))] py-4 transition-colors", active && "border-brand-500 bg-brand-500/5")}>
            <span style={{ backgroundColor: p.color ?? "#0ea894" }} className="flex h-11 w-11 items-center justify-center rounded-full font-display text-lg font-bold text-white">{p.logoInitial ?? p.name.charAt(0).toUpperCase()}</span>
            <span className="text-sm font-semibold">{p.name}</span>
            {active && <Check className="absolute right-2 top-2 h-4 w-4 text-brand-500" />}
          </button>
        );
      })}
    </div>
  );
}
