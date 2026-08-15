"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User as UserIcon, Mail, Phone, Lock } from "lucide-react";
import { toast } from "sonner";
import { AuthSplitShell } from "@/components/shared/auth-split-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerSchema, RegisterInput } from "@/lib/validators/schemas";
import { authApi } from "@/lib/api/auth";

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await authApi.register(data);
      toast.success("Account created — verify your phone to continue");
      router.push(`/verify-otp?phone=${encodeURIComponent(res.phone)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    }
  };

  return (
    <AuthSplitShell
      title="Create your account"
      subtitle="Start paying bills in under a minute"
      footer={
        <p className="text-ink-600 dark:text-paper-200/60">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-600 dark:text-brand-400">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            placeholder="Ngozi Adeyemi"
            leftIcon={<UserIcon className="h-4 w-4" />}
            {...register("fullName")}
          />
          {errors.fullName && <p className="text-xs text-coral-500">{errors.fullName.message}</p>}
        </div>

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
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            placeholder="08034567890"
            leftIcon={<Phone className="h-4 w-4" />}
            {...register("phone")}
          />
          {errors.phone && <p className="text-xs text-coral-500">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-coral-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-coral-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <label className="flex items-start gap-2.5 pt-1 text-xs text-ink-600 dark:text-paper-200/60">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-ink-300" {...register("agreeToTerms")} />
          I agree to the{" "}
          <Link href="/terms" className="font-semibold text-brand-600 dark:text-brand-400">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-brand-600 dark:text-brand-400">
            Privacy Policy
          </Link>
        </label>
        {errors.agreeToTerms && <p className="text-xs text-coral-500">{errors.agreeToTerms.message}</p>}

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthSplitShell>
  );
}
