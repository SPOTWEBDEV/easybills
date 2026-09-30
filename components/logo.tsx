import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  mark = false,
  inverted = false,
}: {
  className?: string;
  mark?: boolean;
  inverted?: boolean;
}) {
  if (mark) {
    return (
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl bg-accent-mesh text-white",
          className
        )}
      >
        <Zap className="h-5 w-5" fill="currentColor" />
      </div>
    );
  }
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-mesh text-white">
        <Zap className="h-4 w-4" fill="currentColor" />
      </div>
      <span className="font-display text-lg font-bold tracking-tight">
        Easy
        <span className={inverted ? "text-brand-200" : "text-brand-600"}>Bills</span>
      </span>
    </div>
  );
}
