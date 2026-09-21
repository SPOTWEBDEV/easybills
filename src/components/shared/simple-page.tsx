import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export function SimplePage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 text-ink-600 dark:text-paper-200/60">{subtitle}</p>}
        <div className="prose prose-sm dark:prose-invert mt-10 max-w-none text-ink-700 dark:text-paper-200/70">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
