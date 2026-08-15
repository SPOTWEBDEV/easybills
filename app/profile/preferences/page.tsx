"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Bell, Palette, Globe, Sun, Moon } from "lucide-react";

const notificationTypes = [
  { id: "transactions", label: "Transaction alerts", description: "Get notified for every purchase or payment" },
  { id: "promotions", label: "Promotions & cashback", description: "Offers, discounts, and cashback updates" },
  { id: "security", label: "Security alerts", description: "New device logins and password changes" },
  { id: "product", label: "Product announcements", description: "New features and services on EasyBills" },
];

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    transactions: true,
    promotions: true,
    security: true,
    product: false,
  });

  const togglePref = (id: string, checked: boolean) => {
    setPrefs((p) => ({ ...p, [id]: checked }));
  };

  const handleCurrencyChange = () => toast.success("Currency preference saved");
  const handleLanguageChange = () => toast.success("Language preference saved");

  return (
    <AppShell>
      <PageHeader title="Preferences" subtitle="Notifications, appearance, and language" />

      <div className="space-y-5 px-5 pt-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300">
                <Bell className="h-4 w-4" />
              </span>
              <CardTitle>Notification settings</CardTitle>
            </div>
            <CardDescription>Choose what you want to hear about.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {notificationTypes.map((n) => (
              <div key={n.id} className="flex items-center justify-between rounded-2xl border border-ink-100 dark:border-ink-700 p-3.5">
                <div className="pr-4">
                  <p className="text-sm font-semibold">{n.label}</p>
                  <p className="text-xs text-ink-500 dark:text-paper-200/40">{n.description}</p>
                </div>
                <Switch checked={prefs[n.id]} onCheckedChange={(checked) => togglePref(n.id, checked)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
                <Palette className="h-4 w-4" />
              </span>
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Switch between light and dark mode.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors ${
                  theme === "light" ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-ink-200 dark:border-ink-700"
                }`}
              >
                <Sun className="h-5 w-5" />
                <span className="text-xs font-semibold">Light</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors ${
                  theme === "dark" ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-ink-200 dark:border-ink-700"
                }`}
              >
                <Moon className="h-5 w-5" />
                <span className="text-xs font-semibold">Dark</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-500">
                <Globe className="h-4 w-4" />
              </span>
              <CardTitle>Language & region</CardTitle>
            </div>
            <CardDescription>Set your preferred language and currency.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40">Language</p>
              <Select defaultValue="en" onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pcm">Pidgin</SelectItem>
                  <SelectItem value="ha">Hausa</SelectItem>
                  <SelectItem value="yo">Yoruba</SelectItem>
                  <SelectItem value="ig">Igbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40">Currency</p>
              <Select defaultValue="ngn" onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ngn">Nigerian Naira (₦)</SelectItem>
                  <SelectItem value="usd">US Dollar ($)</SelectItem>
                  <SelectItem value="gbp">British Pound (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
