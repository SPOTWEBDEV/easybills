"use client";
import { useThemeMode } from "./theme-mode";
import { Moon, Sun } from "lucide-react";

// Minimal class-based toggle. If the landing page already uses next-themes, swap this for its hook.
export function ThemeToggle() {
  const { mode, setMode } = useThemeMode();
  return (
    <IconBtn label="Toggle theme" onClick={() => setMode(mode === "dark" ? "light" : "dark")}>
      {mode === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </IconBtn>
  );
}

export function IconBtn({
  children, label, onClick, dot,
}: { children: React.ReactNode; label: string; onClick?: () => void; dot?: boolean }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-[rgb(var(--bg-elevated))] text-[rgb(var(--fg-muted))] transition-colors hover:text-brand-500"
    >
      {children}
      {dot && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />}
    </button>
  );
}
