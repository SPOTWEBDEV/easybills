"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { NAV_SECTIONS } from "@/components/sidebar";

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

function useCurrentPageTitle(fallback: string) {
  const pathname = usePathname();
  const match = ALL_ITEMS.find(
    (item) => pathname === item.href || pathname?.startsWith(item.href + "/")
  );
  return match?.label ?? fallback;
}

export function Topbar({ title }: { title?: string }) {
  const { admin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const pageTitle = useCurrentPageTitle(title ?? "Admin Panel");

  const initials =
    admin?.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-base/80 px-6 backdrop-blur">
      <p className="font-display text-[15px] font-semibold tracking-tight text-ink">{pageTitle}</p>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-muted transition-all hover:border-brand-500/30 hover:text-ink"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <Link
          href="/notifications"
          aria-label="Send announcement"
          title="Send announcement to customers"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-muted transition-all hover:border-brand-500/30 hover:text-ink"
        >
          <Bell className="h-4 w-4" />
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-sm font-medium text-ink transition-all hover:border-brand-500/30 hover:bg-surface-hover"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-semibold text-paper-50">
              {initials}
            </span>
            {admin?.name?.split(" ")[0] || "Admin"}
            <ChevronDown className={`h-3.5 w-3.5 text-ink-faint transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-44 overflow-hidden rounded-xl border border-line bg-surface-raised shadow-card">
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-bad/10 hover:text-bad"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
