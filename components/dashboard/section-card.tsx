import type { LucideIcon } from "lucide-react";

export function SectionCard({ icon: Icon, tint = "text-brand-500", bg = "bg-brand-500/10", title, description, children }:
  { icon: LucideIcon; tint?: string; bg?: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border bg-[rgb(var(--bg-elevated))] p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg} ${tint}`}><Icon className="h-5 w-5" /></span>
        <div>
          <h2 className="font-display text-base font-bold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-[rgb(var(--fg-muted))]">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
