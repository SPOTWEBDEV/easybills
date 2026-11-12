"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { PinInput } from "@/components/dashboard/pin-input";
import { SubmitButton } from "@/components/dashboard/form-field";
import { useAuth } from "@/components/dashboard/auth-context";
import { securityApi } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";

export default function SetPinPage() {
  const router = useRouter();
  const { markPinSet } = useAuth();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const done = () => { markPinSet(); router.replace("/dashboard"); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return setError("Enter a 4-digit PIN");
    if (pin !== confirm) return setError("PINs don't match");
    setError(undefined); setLoading(true);
    try { await securityApi.setTransactionPin({ pin }); done(); }
    catch (err) {
      // Same as the app: 401 means a PIN already exists, which was the goal.
      if (err instanceof ApiError && err.status === 401) return done();
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-center rounded-3xl border bg-[rgb(var(--bg-elevated))] p-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-500"><ShieldCheck className="h-7 w-7" /></span>
      <h1 className="mt-4 font-display text-2xl font-bold">Set your transaction PIN</h1>
      <p className="mt-2 text-sm text-[rgb(var(--fg-muted))]">You&apos;ll use this 4-digit PIN to confirm every purchase. It keeps your wallet safe even if someone else uses your device.</p>
      <p className="mt-6 self-start text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">Choose a PIN</p>
      <div className="mt-2 w-full"><PinInput value={pin} onChange={setPin} autoFocus label="Choose a PIN" /></div>
      <p className="mt-5 self-start text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">Confirm PIN</p>
      <div className="mt-2 w-full"><PinInput value={confirm} onChange={setConfirm} label="Confirm PIN" /></div>
      {error && <p role="alert" className="mt-4 self-start text-sm text-red-500">{error}</p>}
      <div className="mt-6 w-full"><SubmitButton loading={loading}>Set PIN</SubmitButton></div>
    </form>
  );
}
