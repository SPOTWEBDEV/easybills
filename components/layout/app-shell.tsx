"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { tokenStore } from "@/lib/api-client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!tokenStore.getUserToken()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return <div className="min-h-screen bg-paper-100 dark:bg-ink-950" />;
  }

  return (
    <div className="min-h-screen bg-paper-100 dark:bg-ink-950">
      <div className="mx-auto min-h-screen w-full max-w-md bg-paper-50 dark:bg-ink-950 pb-28 lg:border-x lg:border-ink-200/60 dark:lg:border-ink-700/60 lg:shadow-soft-dark">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
