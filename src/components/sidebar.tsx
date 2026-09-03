"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Receipt,
  Ticket,
  Wallet,
  Users,
  UserCog,
  Percent,
  Gift,
  Package,
  Megaphone,
} from "lucide-react";
import { cx } from "@/lib/utils";
import { Logo } from "@/components/logo";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/revenue", label: "Revenue", icon: TrendingUp },
      { href: "/sales", label: "Sales", icon: ShoppingCart },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/transactions", label: "Transactions", icon: Receipt },
      { href: "/orders", label: "Orders", icon: Ticket },
      { href: "/wallets", label: "Wallets", icon: Wallet },
      { href: "/notifications", label: "Notifications", icon: Megaphone },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/agents", label: "Agents", icon: UserCog },
      { href: "/commissions", label: "Commissions", icon: Percent },
      { href: "/referral-program", label: "Referral Program", icon: Gift },
    ],
  },
  {
    label: "Catalog",
    items: [{ href: "/products", label: "Products", icon: Package }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface/60 px-4 py-6 lg:flex">
      <Link href="/dashboard" className="mb-8 px-2">
        <Logo size="md" />
      </Link>

      <nav className="flex-1 space-y-7 overflow-y-auto pr-1">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cx(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-brand-500/15 text-brand-600"
                          : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
