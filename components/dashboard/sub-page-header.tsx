import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function SubPageHeader({ title, subtitle, back = "/dashboard/services" }: { title: string; subtitle?: string; back?: string }) {
  return (
    <header className="mb-6">
      <Link href={back} aria-label="Back" className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-[rgb(var(--bg-elevated))]">
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      {subtitle && <p className="mt-1 text-[rgb(var(--fg-muted))]">{subtitle}</p>}
    </header>
  );
}
