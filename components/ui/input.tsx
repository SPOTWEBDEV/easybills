import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightSlot, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 flex items-center text-ink-600/60 dark:text-paper-200/40">
            {leftIcon}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 text-sm text-ink-950 dark:text-paper-50 placeholder:text-ink-600/40 dark:placeholder:text-paper-200/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon && "pl-11",
            rightSlot && "pr-16",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightSlot && <span className="absolute right-3.5 flex items-center">{rightSlot}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
