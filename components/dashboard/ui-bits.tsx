"use client";
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export const labelCls = "text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]";

export function Label({ children }: { children: ReactNode }) {
  return <p className={labelCls}>{children}</p>;
}

export function Box({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed py-8 text-center text-sm text-[rgb(var(--fg-muted))]">{children}</div>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4", className)}>{children}</div>;
}

export function ErrorText({ children }: { children?: ReactNode }) {
  return children ? <p role="alert" className="text-center text-sm text-red-500">{children}</p> : null;
}

export function Loading({ text = "Loading…" }: { text?: string }) {
  return <p className="py-6 text-center text-sm text-[rgb(var(--fg-muted))]">{text}</p>;
}

export function PrimaryButton({ loading, children, className, disabled, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button type="button" {...rest} disabled={disabled || loading}
      className={cn("w-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 py-3.5 text-sm font-bold text-white shadow-glow transition-opacity disabled:opacity-60", className)}>
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function GhostButton({ children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...rest}
      className={cn("rounded-full border px-5 py-3 text-sm font-semibold transition-colors hover:border-brand-500/50 disabled:opacity-60", className)}>
      {children}
    </button>
  );
}

export function PillTabs<T extends string>({ items, value, onChange }: { items: { id: T; label: string }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div role="tablist" className="no-scrollbar flex gap-2 overflow-x-auto">
      {items.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold",
            value === t.id ? "border-brand-500 bg-brand-500 text-white" : "bg-[rgb(var(--bg-elevated))] text-[rgb(var(--fg-muted))]")}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function PillSelect({ label, value, onChange, options, error, id }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; error?: string; id?: string;
}) {
  const fid = id ?? label.replace(/\W+/g, "-").toLowerCase();
  return (
    <div className="space-y-2">
      <label htmlFor={fid} className={labelCls}>{label}</label>
      <select id={fid} value={value} onChange={(e) => onChange(e.target.value)}
        className={cn("w-full rounded-full border bg-[rgb(var(--bg-elevated))] px-5 py-3.5 text-sm outline-none focus:border-brand-500", error && "border-red-500")}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

type Tone = "success" | "pending" | "failed" | "neutral";
const TONES: Record<Tone, string> = {
  success: "bg-emerald-500/15 text-emerald-500",
  pending: "bg-amber-500/15 text-amber-500",
  failed: "bg-red-500/15 text-red-500",
  neutral: "bg-brand-500/15 text-brand-500",
};
export function statusTone(s: string): Tone {
  if (["success", "confirmed", "active", "verified", "earned"].includes(s)) return "success";
  if (["pending", "frozen", "manual_review"].includes(s)) return "pending";
  if (["failed", "cancelled"].includes(s)) return "failed";
  return "neutral";
}
export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold capitalize", TONES[tone])}>{children}</span>;
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" aria-label={label}
      onClick={async () => {
        try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
      }}
      className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-500">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : label}
    </button>
  );
}

/** A secret (gift card code, PIN, token). Masked by default, tap to reveal, auto-hides after 30 s or when the tab is hidden. */
export function SecretValue({ label, value, defaultShown = false }: { label: string; value: string; defaultShown?: boolean }) {
  const [show, setShow] = useState(defaultShown);
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 30_000);
    const onVis = () => { if (document.hidden) setShow(false); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearTimeout(t); document.removeEventListener("visibilitychange", onVis); };
  }, [show]);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">{label}</p>
        <p className="break-all font-mono text-sm font-semibold tracking-wider">{show ? value : "•".repeat(Math.min(Math.max(value.length, 6), 16))}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide" : "Show"} className="text-[rgb(var(--fg-muted))]">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

export function ConfirmSheet({ open, title, message, confirmLabel, danger, loading, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel: string; danger?: boolean; loading?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-sm space-y-4 rounded-3xl border bg-[rgb(var(--bg-elevated))] p-6">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <p className="text-sm text-[rgb(var(--fg-muted))]">{message}</p>
        <div className="flex gap-3">
          <GhostButton onClick={onCancel} disabled={loading} className="flex-1">Keep it</GhostButton>
          <button type="button" onClick={onConfirm} disabled={loading}
            className={cn("flex-1 rounded-full py-3 text-sm font-bold text-white disabled:opacity-60", danger ? "bg-red-500" : "bg-brand-500")}>
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
