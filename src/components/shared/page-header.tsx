"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-3 px-5 pt-6 pb-2">
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 transition-colors hover:bg-ink-200 dark:hover:bg-ink-700"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div>
        <h1 className="font-display text-lg font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-ink-600 dark:text-paper-200/50">{subtitle}</p>}
      </div>
    </div>
  );
}
