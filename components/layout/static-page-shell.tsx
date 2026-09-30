import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export function StaticPageShell({
  eyebrow,
  title,
  description,
  children,
  narrow = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950">
      <SiteHeader />
      <main>
        <div className={narrow ? "mx-auto max-w-3xl px-6 py-16 sm:py-20" : "mx-auto max-w-6xl px-6 py-16 sm:py-20"}>
          <div className="mb-12">
            {eyebrow && (
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {eyebrow}
              </span>
            )}
            <h1 className="font-display text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {title}
            </h1>
            {description && <p className="mt-3 max-w-2xl text-ink-muted">{description}</p>}
          </div>
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
