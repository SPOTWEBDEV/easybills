"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, BarChart3, TrendingUp, ShoppingCart, Receipt, Wallet,
  Users, UserCog, Percent, Package, Radio, Tag, SlidersHorizontal, Ticket,
  Megaphone, Bell, FileBarChart, Headphones, Newspaper, FileText, ShieldCheck,
  Settings, ScrollText, Activity, KeyRound, ImageIcon, Gift, X, Circle,
  SlidersHorizontal as SettingsSliders, type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { adminNavItemsApi } from "@/lib/api/admin/nav-items";

// Maps the `icon` string stored in admin_nav_items to an actual component.
// Unknown keys fall back to a generic circle rather than crashing.
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, BarChart3, TrendingUp, ShoppingCart, Receipt, Wallet,
  Users, UserCog, Percent, Package, Radio, Tag, SlidersHorizontal, Ticket,
  Megaphone, Bell, FileBarChart, Headphones, Newspaper, FileText, ShieldCheck,
  Settings, ScrollText, Activity, KeyRound, ImageIcon, Gift,
};

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: navItems, isLoading } = useQuery({
    queryKey: ["admin-nav-items"],
    queryFn: adminNavItemsApi.list,
    staleTime: 60_000,
  });

  console.log("navItems", navItems);

  const visibleItems = (navItems ?? []).filter((item) => item.visible);
  const groups = Array.from(new Set(visibleItems.map((i) => i.group)));

  return (
    <div className="flex h-full flex-col bg-white dark:bg-ink-900 border-r border-ink-200/60 dark:border-ink-700/60">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin">
          <Logo />
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden rounded-full p-1.5 hover:bg-ink-100 dark:hover:bg-ink-800">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 no-scrollbar">
        {isLoading ? (
          <div className="space-y-2 px-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-xl bg-ink-100 dark:bg-ink-800" />
            ))}
          </div>
        ) : (
          groups.map((group) => (
            <div key={group} className="mb-5">
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400 dark:text-paper-200/30">
                {group}
              </p>
              <div className="space-y-0.5">
                {visibleItems
                  .filter((item) => item.group === group)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item) => {
                    const Icon = ICON_MAP[item.icon] ?? Circle;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                            : "text-ink-600 dark:text-paper-200/60 hover:bg-ink-100 dark:hover:bg-ink-800"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))
        )}

        {/* Always visible regardless of the visibility toggles below — this
            is the meta-page that controls those toggles, so hiding it
            would lock admins out of ever un-hiding anything. */}
        <div className="mb-5">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400 dark:text-paper-200/30">
            Configuration
          </p>
          <Link
            href="/admin/settings/navigation"
            onClick={onClose}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/admin/settings/navigation"
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                : "text-ink-600 dark:text-paper-200/60 hover:bg-ink-100 dark:hover:bg-ink-800"
            )}
          >
            <SettingsSliders className="h-4 w-4 shrink-0" />
            <span className="truncate">Navigation</span>
          </Link>
        </div>
      </div>
    </div>
  );
}