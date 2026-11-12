"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, Mail } from "lucide-react";
import { FormField, SubmitButton } from "@/components/dashboard/form-field";
import { useAuth } from "@/components/dashboard/auth-context";
import { authApi } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { loginSchema } from "@/lib/validators/schemas";

export default function LoginPage() {
  const { login, verifyOtp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpEmail, setOtpEmail] = useState<string | null>(null); // set when the backend asks for 2FA
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const msg = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = loginSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setLoading(true);
    try {
      const r = await login(parsed.data);
      if (r.requiresTwoFactor) setOtpEmail(r.email);
      else router.replace("/dashboard");
    } catch (err) { setError(msg(err)); } finally { setLoading(false); }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await verifyOtp({ email: otpEmail!, code: code.trim() }); router.replace("/dashboard"); }
    catch (err) { setError(msg(err)); } finally { setLoading(false); }
  };

  const onResend = async () => {
    setError(""); setInfo("");
    try { await authApi.resendLoginOtp({ email: otpEmail! }); setInfo("We sent a new code to your email."); }
    catch (err) { setError(msg(err)); }
  };

  if (otpEmail) {
    return (
      <form onSubmit={onVerify} className="mt-12 space-y-5">
        <div>
          <h1 className="font-display text-3xl font-bold">Check your email</h1>
          <p className="mt-1.5 text-[rgb(var(--fg-muted))]">Enter the code we sent to {otpEmail}</p>
        </div>
        <FormField label="Verification code" icon={KeyRound} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} required />
        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        {info && <p className="text-center text-sm text-emerald-500">{info}</p>}
        <SubmitButton loading={loading}>Verify and log in</SubmitButton>
        <div className="flex justify-between text-sm font-bold text-brand-500">
          <button type="button" onClick={onResend}>Resend code</button>
          <button type="button" onClick={() => { setOtpEmail(null); setCode(""); setError(""); }}>Use a different account</button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onLogin} className="mt-12 space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold">Welcome back</h1>
        <p className="mt-1.5 text-[rgb(var(--fg-muted))]">Log in to manage your bills and wallet</p>
      </div>
      <FormField label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <FormField label="Password" icon={Lock} isPassword autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
        labelRight={<Link href="/forgot-password" className="text-sm font-bold text-brand-500">Forgot password?</Link>} />
      {error && <p className="text-center text-sm text-red-500">{error}</p>}
      <SubmitButton loading={loading}>Log in</SubmitButton>
      <p className="text-center text-sm text-[rgb(var(--fg-muted))]">
        Don&apos;t have an account? <Link href="/register" className="font-bold text-brand-500">Sign up</Link>
      </p>
    </form>
  );
}
