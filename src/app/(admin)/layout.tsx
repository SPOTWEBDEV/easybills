"use client";

import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { useRequireAuth } from "@/lib/auth";
import { LoadingState } from "@/components/states";
import { poppins } from "@/lib/fonts";

// Poppins, scoped to the admin dashboard only, by overriding the display/body
// font variables that every admin component already reads from via the
// font-display / font-sans utility classes — no other file needs to change.
const ADMIN_FONT_VARS = {
  ["--font-display" as string]: "var(--font-poppins)",
  ["--font-body" as string]: "var(--font-poppins)",
} as React.CSSProperties;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useRequireAuth();

  if (loading || !admin) {
    return (
      <div
        className={`${poppins.variable} flex min-h-screen items-center justify-center bg-base`}
        style={ADMIN_FONT_VARS}
      >
        <LoadingState label="Checking your session…" />
      </div>
    );
  }

  return (
    <div className={`${poppins.variable} flex min-h-screen bg-base`} style={ADMIN_FONT_VARS}>
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
