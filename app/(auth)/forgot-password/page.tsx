"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, Mail } from "lucide-react";
import { FormField, SubmitButton } from "@/components/dashboard/form-field";
import { authApi } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { registerSchema } from "@/lib/validators/schemas";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const msg = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await authApi.forgotPassword({ email: email.trim() }); setStep("reset"); }
    catch (err) { setError(msg(err)); } finally { setLoading(false); }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const pw = registerSchema.shape.password.safeParse(password);
    if (!pw.success) return setError(pw.error.issues[0].message);
    setLoading(true);
    try { await authApi.resetPassword({ email: email.trim(), code: code.trim(), password }); router.replace("/login"); }
    catch (err) { setError(msg(err)); } finally { setLoading(false); }
  };

  return step === "email" ? (
    <form onSubmit={sendCode} className="mt-12 space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold">Reset your password</h1>
        <p className="mt-1.5 text-[rgb(var(--fg-muted))]">We&apos;ll email you a code to set a new one</p>
      </div>
      <FormField label="Email" icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      {error && <p className="text-center text-sm text-red-500">{error}</p>}
      <SubmitButton loading={loading}>Send code</SubmitButton>
      <p className="text-center text-sm"><Link href="/login" className="font-bold text-brand-500">Back to log in</Link></p>
    </form>
  ) : (
    <form onSubmit={reset} className="mt-12 space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold">Set a new password</h1>
        <p className="mt-1.5 text-[rgb(var(--fg-muted))]">Enter the code sent to {email}</p>
      </div>
      <FormField label="Code" icon={KeyRound} inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} required />
      <FormField label="New password" icon={Lock} isPassword autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-center text-sm text-red-500">{error}</p>}
      <SubmitButton loading={loading}>Reset password</SubmitButton>
    </form>
  );
}
