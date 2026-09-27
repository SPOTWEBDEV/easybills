import { FlaskConical } from "lucide-react";

export function PreviewDataBanner({ feature }: { feature: string }) {
  return (
    <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-coral-200 dark:border-coral-500/30 bg-coral-50 dark:bg-coral-500/10 p-4 text-sm text-coral-900 dark:text-coral-200">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        This is preview data — the <strong>{feature}</strong> backend endpoints haven&apos;t been
        built yet (see easybills-backend README, &quot;Not yet implemented as endpoints&quot;). Nothing
        on this page reads or writes to the real database.
      </p>
    </div>
  );
}
