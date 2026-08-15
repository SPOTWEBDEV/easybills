"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Lock, KeyRound, Bell, Palette, Globe, HeadphonesIcon,
  LogOut, ChevronRight, BadgeCheck, FileSpreadsheet, Gift, CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-auth";
import { authApi } from "@/lib/api/auth";

const menuGroups = [
  {
    title: "Account",
    items: [
      { label: "Statement of account", icon: FileSpreadsheet, href: "/statement" },
      { label: "Referrals & earnings", icon: Gift, href: "/referrals" },
      { label: "Payment methods", icon: CreditCard, href: "/wallet/payment-methods" },
    ],
  },
  {
    title: "Security",
    items: [
      { label: "Change password", icon: Lock, href: "/profile/security" },
      { label: "Transaction PIN", icon: KeyRound, href: "/profile/security" },
      { label: "Two-factor authentication", icon: ShieldCheck, href: "/profile/security" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { label: "Notification settings", icon: Bell, href: "/profile/preferences" },
      { label: "Appearance", icon: Palette, href: "/profile/preferences" },
      { label: "Language & region", icon: Globe, href: "/profile/preferences" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help center", icon: HeadphonesIcon, href: "/support" },
    ],
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      toast.success("Logged out");
      router.push("/login");
    }
  };

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4">
        {isLoading || !user ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{user.avatarInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display text-lg font-bold">{user.fullName}</h1>
              <p className="text-xs text-ink-600 dark:text-paper-200/50">{user.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge variant="success" dot>
                  <BadgeCheck className="h-3 w-3" /> {user.kycStatus}
                </Badge>
                <Badge variant="brand">{user.tier}</Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6 px-5">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40">
              {group.title}
            </h2>
            <Card className="divide-y divide-ink-100 dark:divide-ink-700 overflow-hidden p-0">
              {group.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/60"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-ink-400" />
                </Link>
              ))}
            </Card>
          </div>
        ))}

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-coral-200 dark:border-coral-500/30 bg-coral-50 dark:bg-coral-500/10 py-3.5 text-sm font-semibold text-coral-600 dark:text-coral-500"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </AppShell>
  );
}
