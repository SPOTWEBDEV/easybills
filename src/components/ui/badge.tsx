import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500",
        pending: "bg-brand-100 text-brand-900 dark:bg-brand-500/15 dark:text-brand-200",
        failed: "bg-coral-50 text-coral-600 dark:bg-coral-500/10 dark:text-coral-500",
        neutral: "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-paper-200/70",
        brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-emerald-500",
            variant === "pending" && "bg-brand-500",
            variant === "failed" && "bg-coral-500",
            variant === "brand" && "bg-brand-500",
            variant === "neutral" && "bg-ink-500"
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
