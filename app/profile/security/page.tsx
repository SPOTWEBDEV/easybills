"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { OtpInput } from "@/components/ui/otp-input";
import { Lock, KeyRound, ShieldCheck } from "lucide-react";

export default function SecurityPage() {
  const [pin, setPin] = useState("");
  const [twoFa, setTwoFa] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPin, setSavingPin] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    await new Promise((r) => setTimeout(r, 900));
    setSavingPassword(false);
    toast.success("Password updated");
    (e.target as HTMLFormElement).reset();
  };

  const handlePinSave = async () => {
    if (pin.length !== 4) {
      toast.error("Enter a 4-digit PIN");
      return;
    }
    setSavingPin(true);
    await new Promise((r) => setTimeout(r, 900));
    setSavingPin(false);
    toast.success("Transaction PIN set");
    setPin("");
  };

  const handleToggle2fa = (checked: boolean) => {
    setTwoFa(checked);
    toast.success(checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
  };

  return (
    <AppShell>
      <PageHeader title="Security" subtitle="Manage your password, PIN, and 2FA" />

      <div className="space-y-5 px-5 pt-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300">
                <Lock className="h-4 w-4" />
              </span>
              <CardTitle>Change password</CardTitle>
            </div>
            <CardDescription>Use at least 6 characters, including a number.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" required placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" required minLength={6} placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" required minLength={6} placeholder="••••••••" />
              </div>
              <Button type="submit" loading={savingPassword}>
                Update password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500">
                <KeyRound className="h-4 w-4" />
              </span>
              <CardTitle>Transaction PIN</CardTitle>
            </div>
            <CardDescription>Required to confirm every purchase and withdrawal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <OtpInput value={pin} onChange={setPin} numInputs={4} />
            <Button onClick={handlePinSave} loading={savingPin}>
              Save PIN
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-500">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <CardTitle>Two-factor authentication</CardTitle>
            </div>
            <CardDescription>Add an extra layer of security to your account at login.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-2">
            <p className="text-sm font-medium">{twoFa ? "Enabled" : "Disabled"}</p>
            <Switch checked={twoFa} onCheckedChange={handleToggle2fa} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
