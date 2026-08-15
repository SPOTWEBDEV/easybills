"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthSplitShell } from "@/components/shared/auth-split-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginSchema, LoginInput } from "@/lib/validators/schemas";
import { authApi } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    try {
      await authApi.login(data);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
  };

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

      <p className="mt-6 text-center text-xs text-ink-500 dark:text-paper-200/40">
        Demo: use any email + a 6+ character password to log in.
      </p>
    </AuthSplitShell>
  );
}
