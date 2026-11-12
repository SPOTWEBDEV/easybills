"use client";
import { useState } from "react";
import { Bell, Moon, Palette, Sun } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { SectionCard } from "@/components/dashboard/section-card";
import { ToggleRow } from "@/components/dashboard/toggle-row";
import { useThemeMode } from "@/components/dashboard/theme-mode";
import { cn } from "@/lib/utils";


// Same as the app: notification choices are local to this screen (no API call yet). Language & region is hidden until it's supported.
export default function PreferencesPage() {
  const { mode, setMode } = useThemeMode();
  const [n, setN] = useState({ transactions: true, promotions: true, security: true, announcements: false });
  const toggle = (k: keyof typeof n) => (v: boolean) => setN((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <SubPageHeader title="Preferences" subtitle="Notifications and appearance" back="/dashboard/profile" />

      <SectionCard icon={Bell} tint="text-emerald-500" bg="bg-emerald-500/10" title="Notification settings" description="Choose what you want to hear about.">
        <div>
          <ToggleRow title="Transaction alerts" subtitle="Get notified for every purchase or payment" value={n.transactions} onChange={toggle("transactions")} />
          <ToggleRow title="Promotions & cashback" subtitle="Offers, discounts, and cashback updates" value={n.promotions} onChange={toggle("promotions")} />
          <ToggleRow title="Security alerts" subtitle="New device logins and password changes" value={n.security} onChange={toggle("security")} />
          <ToggleRow title="Product announcements" subtitle="New features and services on EasyBills" value={n.announcements} onChange={toggle("announcements")} />
        </div>
      </SectionCard>

      <SectionCard icon={Palette} title="Appearance" description="Switch between light and dark mode.">
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-3">
          {([["light", "Light", Sun], ["dark", "Dark", Moon]] as const).map(([id, label, Icon]) => (
            <button key={id} type="button" role="radio" aria-checked={mode === id} onClick={() => setMode(id)}
              className={cn("flex flex-col items-center gap-2 rounded-2xl border py-5 text-sm font-bold", mode === id ? "border-brand-500 bg-brand-500/5" : "text-[rgb(var(--fg-muted))]")}>
              <Icon className={cn("h-5 w-5", mode === id && "text-brand-500")} /> {label}
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
