"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Gift, Lock, Mail, Phone, User } from "lucide-react";
import { FormField, SubmitButton } from "@/components/dashboard/form-field";
import { useAuth } from "@/components/dashboard/auth-context";
import { ApiError } from "@/lib/api-client";
import { registerSchema } from "@/lib/validators/schemas";
import { cn } from "@/lib/utils";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const ref = useSearchParams().get("ref") ?? ""; // /register?ref=JANE1234
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "", referralCode: ref });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      referralCode: form.referralCode.trim() || undefined,
      agreeToTerms: agreed,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] === "agreeToTerms" ? "agreed" : String(i.path[0]);
        next[k] ??= i.message;
      }
      return setErrors(next);
    }
    setErrors({});

    setLoading(true);
    try {
      const { confirmPassword, agreeToTerms, ...payload } = parsed.data;
      await register(payload);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409)
        setErrors({ email: "That email or phone number is already registered. Try logging in instead." });
      else setErrors({ form: err instanceof ApiError ? err.message : "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-12 space-y-5" noValidate>
      <div>
        <h1 className="font-display text-3xl font-bold">Create your account</h1>
        <p className="mt-1.5 text-[rgb(var(--fg-muted))]">Start paying bills in under a minute</p>
      </div>
      <FormField label="Full name" icon={User} placeholder="Ngozi Adeyemi" autoComplete="name" value={form.fullName} onChange={set("fullName")} error={errors.fullName} />
      <FormField label="Email" icon={Mail} type="email" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
      <FormField label="Phone number" icon={Phone} type="tel" placeholder="08034567890" autoComplete="tel" value={form.phone} onChange={set("phone")} error={errors.phone} />
      <FormField label="Password" icon={Lock} isPassword placeholder="••••••••" autoComplete="new-password" value={form.password} onChange={set("password")} error={errors.password} />
      <FormField label="Confirm password" icon={Lock} isPassword placeholder="••••••••" autoComplete="new-password" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
      <FormField label="Referral code (optional)" icon={Gift} placeholder="e.g. JANE1234" className="uppercase" value={form.referralCode} onChange={set("referralCode")} />

      <div>
        <button type="button" onClick={() => setAgreed((v) => !v)} className="flex items-start gap-2.5 text-left text-sm text-[rgb(var(--fg-muted))]">
          <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px]", agreed && "border-brand-500 bg-brand-500")}>
            {agreed && <Check className="h-3.5 w-3.5 text-white" />}
          </span>
          <span>
            I agree to the <Link href="/terms" className="font-semibold text-brand-500">Terms</Link> and{" "}
            <Link href="/privacy" className="font-semibold text-brand-500">Privacy Policy</Link>
          </span>
        </button>
        {errors.agreed && <p className="mt-2 pl-7 text-xs text-red-500">{errors.agreed}</p>}
      </div>
      {errors.form && <p className="text-center text-sm text-red-500">{errors.form}</p>}
      <SubmitButton loading={loading}>Create account</SubmitButton>
      <p className="text-center text-sm text-[rgb(var(--fg-muted))]">
        Already have an account? <Link href="/login" className="font-bold text-brand-500">Log in</Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
