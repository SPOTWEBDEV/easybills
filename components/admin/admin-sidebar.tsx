"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart3, TrendingUp, ShoppingCart, Receipt, Package,
  Wallet, Gift, Plane, Radio, Bell, Users, Percent, Tag, ShieldCheck,
  SlidersHorizontal, X, type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavGroup = {
  group: string;
  items: NavItem[];
};

// Static navigation config — no DB fetch. Order reflects priority both
// across groups and within each group.
const NAV_GROUPS: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Revenue", href: "/revenue", icon: TrendingUp },
      { label: "Sales", href: "/sales", icon: ShoppingCart },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "Transactions", href: "/transactions", icon: Receipt },
      { label: "Orders", href: "/orders", icon: Package },
      { label: "Wallets", href: "/wallets", icon: Wallet },
      { label: "Gift Cards", href: "/gift-cards", icon: Gift },
      { label: "Flights", href: "/flights", icon: Plane },
      { label: "Providers", href: "/providers", icon: Radio },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    group: "People",
    items: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Referral Program", href: "/referral-program", icon: Percent },
    ],
  },
  {
    group: "Settings",
    items: [
      { label: "Pricing", href: "/pricing", icon: Tag },
      { label: "KYC", href: "/kyc", icon: ShieldCheck },
    ],
  },
  {
    group: "Configuration",
    items: [
      { label: "Navigation", href: "/admin/settings/navigation", icon: SlidersHorizontal },
    ],
  },
];

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

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
        {NAV_GROUPS.map(({ group, items }) => (
          <div key={group} className="mb-5">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400 dark:text-paper-200/30">
              {group}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={`/admin${item.href}`}
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
        ))}
      </div>
    </div>
  );
}