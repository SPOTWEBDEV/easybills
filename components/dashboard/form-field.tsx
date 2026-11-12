"use client";
import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string; icon: LucideIcon; error?: string; isPassword?: boolean; labelRight?: React.ReactNode;
};

export function FormField({ label, icon: Icon, error, isPassword, labelRight, id, className, ...rest }: Props) {
  const [show, setShow] = useState(false);
  const fid = id ?? label.replace(/\W+/g, "-").toLowerCase();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={fid} className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">
          {label}
        </label>
        {labelRight}
      </div>
      <div
        className={cn(
          "flex items-center gap-3 rounded-full border bg-[rgb(var(--bg-elevated))] px-5 py-3.5 transition-colors focus-within:border-brand-500",
          error && "border-red-500"
        )}
      >
        <Icon className="h-5 w-5 shrink-0 text-[rgb(var(--fg-muted))]" />
        <input
          id={fid}
          {...rest}
          type={isPassword ? (show ? "text" : "password") : rest.type}
          className={cn("w-full bg-transparent text-sm outline-none placeholder:text-[rgb(var(--fg-muted))]/60", className)}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility" className="text-[rgb(var(--fg-muted))]">
            {show ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function SubmitButton({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 py-3.5 text-sm font-bold text-white shadow-glow transition-opacity disabled:opacity-60"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
