"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Moon, Sun, X, ArrowRight } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { Logo } from "@/components/logo";

const NAV_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#features", label: "Pricing" },
  { href: "/#agent", label: "Become an Agent" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper-50/80 backdrop-blur dark:bg-ink-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-ink-muted md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:text-ink"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            href="/#download"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-paper-50 transition-colors hover:bg-brand-600"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-muted md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-paper-50 px-6 py-4 dark:bg-ink-950 md:hidden">
          <nav className="flex flex-col gap-4 text-sm text-ink-muted">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-left hover:text-ink"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <Link
              href="/#download"
              onClick={() => setMobileOpen(false)}
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-paper-50"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
