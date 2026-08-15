import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-ink-100 dark:bg-ink-800",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
