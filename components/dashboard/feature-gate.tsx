"use client";
import type { ReactNode } from "react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { Box } from "@/components/dashboard/ui-bits";

/** Renders children only when the feature flag is on. Otherwise shows "temporarily unavailable" (no API calls are made). */
export function FeatureGate({ enabled, title, subtitle, children }: { enabled: boolean; title: string; subtitle: string; children: ReactNode }) {
  if (enabled) return <>{children}</>;
  return (
    <div className="space-y-6">
      <SubPageHeader title={title} subtitle={subtitle} back="/dashboard/services" />
      <Box>
        <p className="font-semibold">Temporarily unavailable</p>
        <p className="mt-1">This service isn&apos;t available right now. Please check back soon.</p>
      </Box>
    </div>
  );
}
