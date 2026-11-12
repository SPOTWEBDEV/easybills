"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, BottomNav } from "@/components/dashboard/nav";
import { AuthProvider, useAuth } from "@/components/dashboard/auth-context";
import { PinPromptProvider } from "@/components/dashboard/pin-prompt-context";

const SET_PIN = "/dashboard/set-pin";

function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading, requiresPinSetup } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const wide = path === "/dashboard" || path === "/dashboard/services"; // dashboards use the full width; forms stay readable

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (requiresPinSetup && path !== SET_PIN) router.replace(SET_PIN); // mandatory, like the app
  }, [loading, user, requiresPinSetup, path, router]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[rgb(var(--fg-muted))]">Loading…</div>;
  }
  if (path === SET_PIN) return <main className="mx-auto min-h-screen max-w-md px-5 py-10">{children}</main>;
  return (
    <div className="min-h-screen">
      <Sidebar />
      {/* lg:pl-64 (not margin) so the page never overflows horizontally next to the fixed sidebar */}
      <main className="min-w-0 px-5 pb-28 pt-6 lg:pl-64 lg:pb-12 print:pl-0 print:pt-0">
        <div className={`mx-auto w-full lg:px-10 print:px-0 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PinPromptProvider><Shell>{children}</Shell></PinPromptProvider>
    </AuthProvider>
  );
}
