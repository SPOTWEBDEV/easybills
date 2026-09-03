"use client";

import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { useRequireAuth } from "@/lib/auth";
import { LoadingState } from "@/components/states";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useRequireAuth();

  if (loading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <LoadingState label="Checking your session…" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
