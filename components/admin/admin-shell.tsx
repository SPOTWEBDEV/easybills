"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Bell, ChevronDown, LogOut } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { tokenStore } from "@/lib/api-client";
import { adminAuthApi } from "@/lib/api/admin/auth";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!tokenStore.getAdminToken()) {
      router.replace("/admin/login");
      return;
    }
    setChecked(true);
  }, [router]);

  const handleLogout = () => {
    adminAuthApi.logout();
    router.push("/admin/login");
  };

  if (!checked) {
    return <div className="min-h-screen bg-paper-50 dark:bg-ink-950" />;
  }

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="fixed h-screen w-64">
          <AdminSidebar />
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72">
            <AdminSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200/60 dark:border-ink-700/60 bg-white/90 dark:bg-ink-900/90 backdrop-blur-lg px-4 py-3 lg:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="hidden lg:block">
            <p className="text-xs text-ink-500 dark:text-paper-200/40">Admin Panel</p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/admin/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-coral-500" />
            </Link>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-700 py-1 pl-1 pr-2.5"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">AD</AvatarFallback>
                </Avatar>
                <span className="hidden text-xs font-semibold sm:inline">Admin</span>
                <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-850 shadow-soft-dark">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-coral-600 dark:text-coral-500 hover:bg-coral-50 dark:hover:bg-coral-500/10"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
