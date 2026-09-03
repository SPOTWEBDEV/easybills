import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-16 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover text-ink-faint">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mb-1 font-display text-base font-semibold text-ink">{title}</p>
      <p className="max-w-sm text-sm text-ink-faint">{description}</p>
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-faint">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-bad/30 bg-bad/5 px-6 py-14 text-center">
      <p className="text-sm text-bad">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-medium text-ink hover:bg-surface-hover"
        >
          Try again
        </button>
      )}
    </div>
  );
}
