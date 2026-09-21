"use client";

import { useState } from "react";
import { cx } from "@/lib/utils";
import { ApplicationsPanel } from "@/components/kyc/applications-panel";
import { TierLimitsPanel } from "@/components/kyc/tier-limits-panel";

const TABS = [
  { id: "applications", label: "Applications" },
  { id: "tier-limits", label: "Tier Limits" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function KycPage() {
  const [tab, setTab] = useState<TabId>("applications");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">KYC</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Review NIN/BVN applications and set wallet &amp; transaction limits per tier
        </p>
      </div>

      <div className="mb-6 inline-flex rounded-lg border border-line bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cx(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id ? "bg-brand-500/15 text-brand-600" : "text-ink-muted hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "applications" && <ApplicationsPanel />}
      {tab === "tier-limits" && <TierLimitsPanel />}
    </div>
  );
}
