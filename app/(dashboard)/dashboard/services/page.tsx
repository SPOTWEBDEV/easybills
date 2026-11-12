import Link from "next/link";
import { SERVICES } from "@/components/dashboard/services";

export default function ServicesPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Services</h1>
      <p className="mt-1 text-[rgb(var(--fg-muted))]">Everything you need, in one tap</p>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {SERVICES.map(({ key, label, desc, icon: Icon, tint, bg, href, comingSoon }) => {
          const body = (
            <>
              <span className={`flex h-14 w-14 items-center justify-center rounded-full ${bg}`}><Icon className={`h-6 w-6 ${tint}`} /></span>
              <p className="mt-6 font-display text-lg font-bold">{label}</p>
              <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">{desc}</p>
              {comingSoon && <span className="mt-3 self-start rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-500">Coming soon</span>}
            </>
          );
          const cls = "flex flex-col rounded-3xl border bg-[rgb(var(--bg-elevated))] p-5";
          return comingSoon
            ? <div key={key} aria-disabled="true" className={`${cls} opacity-60`}>{body}</div>
            : <Link key={key} href={href} className={`${cls} transition-colors hover:border-brand-500/50`}>{body}</Link>;
        })}
      </div>
    </div>
  );
}
