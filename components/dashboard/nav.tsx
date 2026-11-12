"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Receipt, User, Zap, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/dashboard/auth-context";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/services", label: "Services", icon: LayoutGrid },
  { href: "/dashboard/history", label: "History", icon: Receipt },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];
const isActive = (path: string, href: string) =>
  href === "/dashboard" ? path === href : path.startsWith(href);

export function Sidebar() {
  const path = usePathname();
  const { logout } = useAuth();
  return (
    <aside className="fixed inset-y-0 left-0 hidden print:hidden w-64 flex-col border-r bg-[rgb(var(--bg-elevated))] p-5 lg:flex">
      <Logo />
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
              isActive(path, href)
                ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                : "text-[rgb(var(--fg-muted))] hover:bg-brand-500/5"
            )}
          >
            <Icon className="h-5 w-5" /> {label}
          </Link>
        ))}
        <Link
          href="/dashboard/services"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-glow"
        >
          <Zap className="h-4 w-4 fill-white" /> Pay a bill
        </Link>
      </nav>
      <button
        onClick={logout}
        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10"
      >
        <LogOut className="h-5 w-5" /> Log out
      </button>
    </aside>
  );
}

export function BottomNav() {
  const path = usePathname();
  const left = ITEMS.slice(0, 2);
  const right = ITEMS.slice(2);
  const tab = ({ href, label, icon: Icon }: (typeof ITEMS)[number]) => (
    <Link
      key={href}
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold",
        isActive(path, href) ? "text-brand-500" : "text-[rgb(var(--fg-muted))]"
      )}
    >
      <Icon className="h-5 w-5" /> {label}
    </Link>
  );
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 print:hidden flex items-end border-t bg-[rgb(var(--bg-elevated))] pb-[env(safe-area-inset-bottom)] lg:hidden">
      {left.map(tab)}
      <Link
        href="/dashboard/services"
        aria-label="Pay a bill"
        className="-mt-6 mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 shadow-glow"
      >
        <Zap className="h-6 w-6 fill-white text-white" />
      </Link>
      {right.map(tab)}
    </nav>
  );
}
