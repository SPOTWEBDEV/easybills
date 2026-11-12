"use client";
import Link from "next/link";
import { BadgeCheck, ChevronRight, FileText, Gift, LogOut, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Avatar } from "@/components/dashboard/avatar";
import { useAuth } from "@/components/dashboard/auth-context";

const GROUPS = [
  { title: "Account", items: [
    { label: "Statement of account", icon: FileText, href: "/dashboard/profile/statement" },
    { label: "Referrals & earnings", icon: Gift, href: "/dashboard/profile/referrals" },
  ]},
  { title: "Verification", items: [{ label: "Identity Verification (NIN / BVN)", icon: ShieldCheck, href: "/dashboard/profile/verification" }] },
  { title: "Security", items: [{ label: "Security", icon: ShieldCheck, href: "/dashboard/profile/security" }] },
  { title: "Preferences", items: [{ label: "Preferences", icon: SlidersHorizontal, href: "/dashboard/profile/preferences" }] },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  return (
    <div className="space-y-7">
      <div className="flex items-center gap-4">
        <Avatar name={user?.fullName ?? "?"} size={72} />
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold">{user?.fullName}</p>
          <p className="truncate text-sm text-[rgb(var(--fg-muted))]">{user?.email}</p>
          <div className="mt-2 flex gap-2 text-xs font-bold text-emerald-500">
            {user?.kycStatus === "verified" && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1"><BadgeCheck className="h-3.5 w-3.5" /> verified</span>}
            {user?.tier && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1">{user.tier}</span>}
          </div>
        </div>
      </div>

      {GROUPS.map((g) => (
        <section key={g.title}>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">{g.title}</h2>
          <div className="space-y-2">
            {g.items.map(({ label, icon: Icon, href }) => (
              <Link key={label} href={href} className="flex items-center gap-4 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 transition-colors hover:border-brand-500/50">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900/5 text-brand-500 dark:bg-white/5"><Icon className="h-5 w-5" /></span>
                <span className="flex-1 font-semibold">{label}</span>
                <ChevronRight className="h-5 w-5 text-[rgb(var(--fg-muted))]" />
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">Session</h2>
        <button onClick={logout} className="flex w-full items-center gap-4 rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4 text-red-500">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10"><LogOut className="h-5 w-5" /></span>
          <span className="font-semibold">Log out</span>
        </button>
      </section>
    </div>
  );
}
