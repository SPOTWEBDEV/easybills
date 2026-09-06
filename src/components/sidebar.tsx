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
  Gift,
  CreditCard,
  Plane,
  Megaphone,
} from "lucide-react";
import { cx } from "@/lib/utils";
import { Logo } from "@/components/logo";

export const NAV_SECTIONS = [
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
      { href: "/gift-cards", label: "Gift Cards", icon: CreditCard },
      { href: "/flights", label: "Flights", icon: Plane },
      { href: "/notifications", label: "Notifications", icon: Megaphone },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/referral-program", label: "Referral Program", icon: Gift },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface/70 px-4 py-6 lg:flex">
      <Link href="/dashboard" className="mb-8 px-2">
        <Logo  />
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.label}>
            {idx > 0 && <div className="mb-6 h-px bg-line" />}
            <p className="mb-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cx(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-brand-500/10 text-brand-600"
                          : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-brand-500" />
                      )}
                      <span
                        className={cx(
                          "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                          active
                            ? "bg-brand-500/15 text-brand-600"
                            : "text-ink-faint group-hover:text-ink-muted"
                        )}
                      >
                        <Icon className="h-[16px] w-[16px]" strokeWidth={2.25} />
                      </span>
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
