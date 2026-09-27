"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { securityApi } from "@/lib/api/security";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";

export default function SecurityPage() {
  const queryClient = useQueryClient();
  const { data: userRes } = useQuery({ queryKey: ["current-user"], queryFn: authApi.me });
  const user = userRes?.user;

  // --- Change password ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await securityApi.changePassword(currentPassword, newPassword);
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  // --- Transaction PIN ---
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  const handlePinSave = async () => {
    if (newPin.length !== 4) {
      toast.error("Enter a 4-digit PIN.");
      return;
    }
    if (user?.hasTransactionPin && currentPin.length !== 4) {
      toast.error("Enter your current PIN to change it.");
      return;
    }
    setSavingPin(true);
    try {
      await securityApi.setTransactionPin(newPin, user?.hasTransactionPin ? currentPin : undefined);
      toast.success(user?.hasTransactionPin ? "Transaction PIN updated" : "Transaction PIN set");
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      setCurrentPin("");
      setNewPin("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save PIN.");
    } finally {
      setSavingPin(false);
    }
  };

  // --- Two-factor authentication ---
  const [togglingTwoFactor, setTogglingTwoFactor] = useState(false);

  const handleToggle2fa = async (checked: boolean) => {
    setTogglingTwoFactor(true);
    try {
      await securityApi.setTwoFactor(checked);
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success(checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update 2FA setting.");
    } finally {
      setTogglingTwoFactor(false);
    }
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
                <Input
                  id="current"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new">New password</Label>
                <Input
                  id="new"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
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
            <CardDescription>
              {user?.hasTransactionPin
                ? "Required to confirm every purchase."
                : "Set a 4-digit PIN to confirm your purchases."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {user?.hasTransactionPin && (
              <div className="space-y-1.5">
                <Label>Current PIN</Label>
                <OtpInput value={currentPin} onChange={setCurrentPin} numInputs={4} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>{user?.hasTransactionPin ? "New PIN" : "Set PIN"}</Label>
              <OtpInput value={newPin} onChange={setNewPin} numInputs={4} />
            </div>
            <Button onClick={handlePinSave} loading={savingPin}>
              {user?.hasTransactionPin ? "Update PIN" : "Save PIN"}
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
            <p className="text-sm font-medium">{user?.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
            <Switch
              checked={!!user?.twoFactorEnabled}
              disabled={togglingTwoFactor}
              onCheckedChange={handleToggle2fa}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}