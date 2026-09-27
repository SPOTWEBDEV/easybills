"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Grid2x2, Receipt, Bell, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Grid2x2 },
  { href: "__fab__", label: "", icon: Zap },
  { href: "/transactions", label: "History", icon: Receipt },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-ink-200/60 dark:border-ink-700/60 bg-white/90 dark:bg-ink-900/90 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 items-center px-2">
        {items.map((item) => {
          if (item.href === "__fab__") {
            return (
              <div key="fab" className="flex items-center justify-center">
                <button
                  onClick={() => router.push("/services/airtime")}
                  aria-label="Quick purchase"
                  className="-mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-mesh shadow-glow transition-transform active:scale-90"
                >
                  <Zap className="h-6 w-6 text-white" fill="currentColor" />
                </button>
              </div>
            );
          }
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-brand-600 dark:text-brand-400" : "text-ink-500 dark:text-paper-200/40"
                )}
              />
              <span className={cn(active ? "text-brand-600 dark:text-brand-400" : "text-ink-500 dark:text-paper-200/40")}>
                {item.label}
              </span>
              {active && (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute -top-0.5 h-0.5 w-8 rounded-full bg-brand-600 dark:bg-brand-400"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
