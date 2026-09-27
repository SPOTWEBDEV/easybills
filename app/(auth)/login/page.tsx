"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AuthSplitShell } from "@/components/shared/auth-split-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { loginSchema, LoginInput } from "@/lib/validators/schemas";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Two-factor step
  const [twoFactorPhone, setTwoFactorPhone] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await authApi.login(data);
      if (res.requiresTwoFactor && res.phone) {
        setTwoFactorPhone(res.phone);
        toast.success("Enter the code we sent to verify it's you");
        return;
      }
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!twoFactorPhone || otpCode.length !== 6) return;
    setVerifyingOtp(true);
    try {
      await authApi.verifyLoginOtp(twoFactorPhone, otpCode);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Incorrect code.");
      setOtpCode("");
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (twoFactorPhone) {
    return (
      <AuthSplitShell
        title="Two-factor verification"
        subtitle={`Enter the 6-digit code sent to ${twoFactorPhone}`}
      >
        <div className="space-y-6">
          <OtpInput value={otpCode} onChange={setOtpCode} numInputs={6} />
          <Button
            size="lg"
            className="w-full"
            disabled={otpCode.length !== 6}
            loading={verifyingOtp}
            onClick={handleVerifyOtp}
          >
            Verify &amp; continue
          </Button>
          <button
            type="button"
            onClick={() => {
              setTwoFactorPhone(null);
              setOtpCode("");
            }}
            className="w-full text-center text-sm font-semibold text-ink-500 dark:text-paper-200/40"
          >
            Back to login
          </button>
        </div>
      </AuthSplitShell>
    );
  }

  return (
    <AuthSplitShell
      title="Welcome back"
      subtitle="Log in to manage your bills and wallet"
      footer={
        <p className="text-ink-600 dark:text-paper-200/60">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-brand-600 dark:text-brand-400">
            Sign up
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-coral-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-ink-500">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-coral-500">{errors.password.message}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Log in
        </Button>
      </form>
    </AuthSplitShell>
  );
}