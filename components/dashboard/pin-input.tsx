"use client";
import { useRef } from "react";

export function PinInput({ value, onChange, length = 4, autoFocus, label }: { value: string; onChange: (v: string) => void; length?: number; autoFocus?: boolean; label: string }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => refs.current[i]?.focus();
  return (
    <div role="group" aria-label={label} className="flex justify-center gap-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          autoFocus={autoFocus && i === 0}
          type="password" inputMode="numeric" autoComplete="off"
          aria-label={`${label}, digit ${i + 1}`}
          value={value[i] ?? ""}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            if (!d) return;
            onChange((value.slice(0, i) + d + value.slice(i + 1)).slice(0, length));
            focus(i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key !== "Backspace") return;
            e.preventDefault();
            if (value[i]) onChange(value.slice(0, i) + value.slice(i + 1));
            else if (i > 0) { onChange(value.slice(0, i - 1) + value.slice(i)); focus(i - 1); }
          }}
          onPaste={(e) => {
            const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (d) { e.preventDefault(); onChange(d); focus(Math.min(d.length, length - 1)); }
          }}
          className="h-14 w-12 rounded-2xl border bg-[rgb(var(--bg-elevated))] text-center font-display text-2xl outline-none focus:border-brand-500"
        />
      ))}
    </div>
  );
}
