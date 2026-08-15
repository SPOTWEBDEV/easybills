"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/shared/auth-shell";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";

function VerifyOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone") ?? "your phone";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await authApi.verifyOtp(phone, code);
      toast.success("Phone verified — welcome to EasyBills!");
      router.push("/welcome");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await authApi.resendOtp(phone);
    toast.success("Code resent");
    setCooldown(30);
  };

  return (
    <AuthShell title="Verify your phone" subtitle={`Enter the 6-digit code sent to ${phone}`}>
      <div className="space-y-6">
        <OtpInput value={code} onChange={setCode} numInputs={6} />

        <Button
          size="lg"
          className="w-full"
          disabled={code.length !== 6}
          loading={loading}
          onClick={handleVerify}
        >
          Verify &amp; continue
        </Button>

        <p className="text-center text-sm text-ink-600 dark:text-paper-200/60">
          Didn&apos;t get a code?{" "}
          {cooldown > 0 ? (
            <span className="font-semibold text-ink-400 dark:text-paper-200/30">Resend in {cooldown}s</span>
          ) : (
            <button onClick={handleResend} className="font-semibold text-brand-600 dark:text-brand-400">
              Resend code
            </button>
          )}
        </p>

        <p className="text-center text-xs text-ink-500 dark:text-paper-200/40">Demo code: 123456</p>
      </div>
    </AuthShell>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}
