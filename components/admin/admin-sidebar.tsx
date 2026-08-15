"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart3, TrendingUp, ShoppingCart, Receipt, Wallet,
  Users, UserCog, Percent, Package, Radio, Tag, SlidersHorizontal, Ticket,
  Megaphone, Bell, FileBarChart, Headphones, Newspaper, FileText, ShieldCheck,
  Settings, ScrollText, Activity, KeyRound, X, ImageIcon, Gift,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Revenue", href: "/admin/revenue", icon: TrendingUp },
      { label: "Sales", href: "/admin/sales", icon: ShoppingCart },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Transactions", href: "/admin/transactions", icon: Receipt },
      { label: "Orders", href: "/admin/orders", icon: Ticket },
      { label: "Wallets", href: "/admin/wallets", icon: Wallet },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Agents", href: "/admin/agents", icon: UserCog },
      { label: "Commissions", href: "/admin/commissions", icon: Percent },
      { label: "Referral Program", href: "/admin/referral-program", icon: Gift },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Bill Providers", href: "/admin/providers", icon: Radio },
      { label: "Pricing", href: "/admin/pricing", icon: Tag },
      { label: "Profit Settings", href: "/admin/profit-settings", icon: SlidersHorizontal },
      { label: "Coupons", href: "/admin/coupons", icon: Ticket },
    ],
  },
  {
    title: "Engagement",
    items: [
      { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Reports", href: "/admin/reports", icon: FileBarChart },
      { label: "Support Tickets", href: "/admin/support-tickets", icon: Headphones },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "Pages", href: "/admin/pages", icon: FileText },
      { label: "Media Library", href: "/admin/media-library", icon: ImageIcon },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck },
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
      { label: "Activity Logs", href: "/admin/activity-logs", icon: Activity },
      { label: "API Management", href: "/admin/api-management", icon: KeyRound },
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
        {navGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-400 dark:text-paper-200/30">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                        : "text-ink-600 dark:text-paper-200/60 hover:bg-ink-100 dark:hover:bg-ink-800"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
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
