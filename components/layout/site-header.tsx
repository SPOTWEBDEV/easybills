"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#agents", label: "Pricing" },
  { href: "#agents", label: "Become an Agent" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/60 dark:border-ink-700/60 bg-paper-50/80 dark:bg-ink-950/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-700 dark:text-paper-200/70 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Button asChild variant="ghost" size="md">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="primary" size="md">
            <Link href="/register">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-200/60 dark:border-ink-700/60 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink-700 dark:text-paper-200/70"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild variant="primary" className="flex-1">
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
