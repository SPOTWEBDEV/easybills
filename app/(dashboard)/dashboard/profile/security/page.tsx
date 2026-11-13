"use client";
import { useState } from "react";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { SectionCard } from "@/components/dashboard/section-card";
import { ToggleRow } from "@/components/dashboard/toggle-row";
import { PinInput } from "@/components/dashboard/pin-input";
import { FormField, SubmitButton } from "@/components/dashboard/form-field";
import { useAuth } from "@/components/dashboard/auth-context";
import { securityApi } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { passwordSchema } from "@/lib/validators/schemas";

const Ok = ({ children }: { children: React.ReactNode }) => <p role="status" className="text-sm font-semibold text-emerald-500">{children}</p>;
const Err = ({ children }: { children: React.ReactNode }) => <p role="alert" className="text-sm text-red-500">{children}</p>;
const msg = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Try again.");
const flash = (set: (v: boolean) => void) => { set(true); setTimeout(() => set(false), 3000); };

export default function SecurityPage() {
  const { user } = useAuth();

  // Change password
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwLoading, setPwLoading] = useState(false);
  const [pwOk, setPwOk] = useState(false);
  const onPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!pw.current) errs.current = "Enter your current password";
    const rule = passwordSchema.safeParse(pw.next);
    if (!rule.success) errs.next = rule.error.issues[0].message;
    if (pw.confirm !== pw.next) errs.confirm = "Passwords don't match";
    setPwErrors(errs);
    if (Object.keys(errs).length) return;
    setPwLoading(true);
    try {
      await securityApi.changePassword({ currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: "", next: "", confirm: "" }); flash(setPwOk);
    } catch (err) {
      setPwErrors(err instanceof ApiError && err.status === 401 ? { current: "Current password is incorrect" } : { form: msg(err) });
    } finally { setPwLoading(false); }
  };

  // Transaction PIN
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState<string>();
  const [pinLoading, setPinLoading] = useState(false);
  const [pinOk, setPinOk] = useState(false);
  const onPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) return setPinError("Enter a 4-digit PIN");
    setPinError(undefined); setPinLoading(true);
    try {
      await securityApi.setTransactionPin({ pin: newPin, currentPin: currentPin.length === 4 ? currentPin : undefined });
      setCurrentPin(""); setNewPin(""); flash(setPinOk);
    } catch (err) {
      setPinError(err instanceof ApiError && err.status === 401 ? "Current PIN is incorrect" : msg(err));
    } finally { setPinLoading(false); }
  };

  // Two-factor
  const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled ?? false);
  const [tfLoading, setTfLoading] = useState(false);
  const [tfError, setTfError] = useState<string>();
  const onTwoFactor = async (next: boolean) => {
    setTwoFactor(next); setTfError(undefined); setTfLoading(true);
    try { setTwoFactor((await securityApi.setTwoFactor({ enabled: next })).twoFactorEnabled); }
    catch (err) { setTwoFactor(!next); setTfError(err instanceof ApiError ? err.message : "Couldn't update this setting."); }
    finally { setTfLoading(false); }
  };

  const pinLabel = "mb-2 text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]";
  return (
    <div className="space-y-5">
      <SubPageHeader title="Security" subtitle="Manage your password, PIN, and 2FA" back="/dashboard/profile" />

      <SectionCard icon={Lock} title="Change password" description="Use 8+ characters, with letters and numbers.">
        <form onSubmit={onPassword} className="space-y-4" noValidate>
          {pwOk && <Ok>Password updated ✓</Ok>}
          <FormField label="Current password" icon={Lock} isPassword autoComplete="current-password" placeholder="••••••••" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} error={pwErrors.current} />
          <FormField label="New password" icon={Lock} isPassword autoComplete="new-password" placeholder="••••••••" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} error={pwErrors.next} />
          <FormField label="Confirm new password" icon={Lock} isPassword autoComplete="new-password" placeholder="••••••••" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} error={pwErrors.confirm} />
          {pwErrors.form && <Err>{pwErrors.form}</Err>}
          <SubmitButton loading={pwLoading}>Update password</SubmitButton>
        </form>
      </SectionCard>

      <SectionCard icon={KeyRound} tint="text-emerald-500" bg="bg-emerald-500/10" title="Transaction PIN"
        description="A 4-digit PIN you'll use to confirm purchases. Avoid easy patterns like 1234 or 0000. Leave “Current PIN” blank if you're setting one for the first time.">
        <form onSubmit={onPin} className="space-y-4">
          {pinOk && <Ok>PIN saved ✓</Ok>}
          <div><p className={pinLabel}>Current PIN (if you have one)</p><PinInput value={currentPin} onChange={setCurrentPin} label="Current PIN" /></div>
          <div><p className={pinLabel}>New PIN</p><PinInput value={newPin} onChange={setNewPin} label="New PIN" /></div>
          {pinError && <Err>{pinError}</Err>}
          <SubmitButton loading={pinLoading}>Save PIN</SubmitButton>
        </form>
      </SectionCard>

      <SectionCard icon={ShieldCheck} title="Two-factor authentication" description="Add an extra layer of security when you log in.">
        <ToggleRow title="Enable 2FA" subtitle="We'll send a code to your email at login" value={twoFactor} onChange={onTwoFactor} disabled={tfLoading} />
        {tfLoading && <p className="text-xs text-[rgb(var(--fg-muted))]">Saving…</p>}
        {tfError && <Err>{tfError}</Err>}
      </SectionCard>
    </div>
  );
}
