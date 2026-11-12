"use client";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Circle, Clock, CreditCard, ShieldCheck, XCircle } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { SectionCard } from "@/components/dashboard/section-card";
import { FormField, SubmitButton } from "@/components/dashboard/form-field";
import { useAuth } from "@/components/dashboard/auth-context";
import { kycApi, type ApplicationStatus, type KycApplication, type KycStatus } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api-client";
import { formatNaira } from "@/lib/utils";

const fmtDate = (s: string) => {
  const d = new Date(s.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};
const statusIcon = (verified: boolean, st?: ApplicationStatus) =>
  verified ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
  : st === "pending" ? <Clock className="h-4 w-4 text-amber-500" />
  : st === "declined" ? <XCircle className="h-4 w-4 text-red-500" />
  : <Circle className="h-4 w-4 text-[rgb(var(--fg-muted))]" />;
const digits = (v: string) => v.replace(/\D/g, "").slice(0, 11);
const msg = (e: unknown) => (e instanceof ApiError ? (e.status === 429 ? "Too many attempts. Try again in an hour." : e.message) : "Something went wrong. Try again.");

function Decline({ app }: { app?: KycApplication | null }) {
  if (app?.status !== "declined" || !app.declineReason) return null;
  return <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-500"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{app.declineReason}</div>;
}

export default function VerificationPage() {
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<KycStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setStatus(await kycApi.getStatus()); } catch {} finally { setLoading(false); } // falls back to "not yet submitted"
  }, []);
  useEffect(() => { load(); }, [load]);

  const ninSt = status?.ninApplication?.status;
  const bvnSt = status?.bvnApplication?.status;

  // NIN
  const [nin, setNin] = useState(""); const [dob, setDob] = useState("");
  const [ninErr, setNinErr] = useState<Record<string, string>>({}); const [ninLoading, setNinLoading] = useState(false); const [ninOk, setNinOk] = useState<string | null>(null);
  const onNin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (nin.length !== 11) errs.nin = "Enter your 11-digit NIN";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) errs.dob = "Enter your date of birth";
    setNinErr(errs); if (Object.keys(errs).length) return;
    setNinLoading(true);
    try { const r = await kycApi.verifyNin({ nin, dateOfBirth: dob }); setNinOk(r.message); setNin(""); setDob(""); await load(); }
    catch (err) { setNinErr({ form: msg(err) }); } finally { setNinLoading(false); }
  };

  // BVN
  const [bvn, setBvn] = useState("");
  const [bvnErr, setBvnErr] = useState<Record<string, string>>({}); const [bvnLoading, setBvnLoading] = useState(false); const [bvnOk, setBvnOk] = useState<string | null>(null);
  const onBvn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bvn.length !== 11) return setBvnErr({ bvn: "Enter your 11-digit BVN" });
    setBvnErr({}); setBvnLoading(true);
    try { const r = await kycApi.verifyBvn({ bvn }); setBvnOk(r.message); setBvn(""); await load(); await refreshUser(); }
    catch (err) { setBvnErr({ form: msg(err) }); } finally { setBvnLoading(false); }
  };

  const Review = ({ title, app }: { title: string; app?: KycApplication | null }) => (
    <SectionCard icon={Clock} tint="text-amber-500" bg="bg-amber-500/10" title={title} description="We'll notify you once a decision is made.">
      <p className="text-xs text-[rgb(var(--fg-muted))]">Submitted {app ? fmtDate(app.createdAt) : ""}</p>
    </SectionCard>
  );

  return (
    <div className="space-y-5">
      <SubPageHeader title="Identity Verification" subtitle="Submit your NIN and BVN for review to unlock higher limits" back="/dashboard/profile" />
      {loading ? <p className="py-10 text-center text-sm text-[rgb(var(--fg-muted))]">Loading…</p> : (<>
        <SectionCard icon={ShieldCheck} title="Current tier" description="Your verification status and the limits it unlocks.">
          <span className="inline-block rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500">{status?.tier ?? "Tier 1"}</span>
          <div className="space-y-2 text-sm font-semibold">
            <p className="flex items-center gap-2">{statusIcon(!!status?.ninVerified, ninSt)} NIN verified {!status?.ninVerified && ninSt && <span className="text-xs font-semibold text-[rgb(var(--fg-muted))]">({ninSt})</span>}</p>
            <p className="flex items-center gap-2">{statusIcon(!!status?.bvnVerified, bvnSt)} BVN verified {!status?.bvnVerified && bvnSt && <span className="text-xs font-semibold text-[rgb(var(--fg-muted))]">({bvnSt})</span>}</p>
          </div>
          {status?.limits && (
            <dl className="space-y-1.5 text-sm">
              {([["Max wallet balance", status.limits.maxWalletBalance], ["Max single transaction", status.limits.maxSingleTransaction], ["Max daily total", status.limits.maxDailyTotal]] as const).map(([l, v]) => (
                <div key={l} className="flex justify-between"><dt className="text-[rgb(var(--fg-muted))]">{l}</dt><dd className="font-bold">{formatNaira(v)}</dd></div>
              ))}
            </dl>
          )}
        </SectionCard>

        {!status?.ninVerified && ninSt === "pending" && <Review title="NIN under review" app={status?.ninApplication} />}
        {!status?.ninVerified && ninSt !== "pending" && (
          <SectionCard icon={CreditCard} tint="text-emerald-500" bg="bg-emerald-500/10" title={ninSt === "declined" ? "Reapply for NIN verification" : "Verify your NIN"}
            description="Required to unlock Tier 2: higher limits, flight booking, and selling gift cards.">
            <form onSubmit={onNin} className="space-y-4" noValidate>
              <Decline app={status?.ninApplication} />
              {ninOk && <p role="status" className="text-sm font-semibold text-emerald-500">{ninOk}</p>}
              <FormField label="NIN" icon={CreditCard} inputMode="numeric" placeholder="12345678901" value={nin} onChange={(e) => setNin(digits(e.target.value))} error={ninErr.nin} />
              <FormField label="Date of birth" icon={CalendarDays} type="date" max={new Date().toISOString().slice(0, 10)} value={dob} onChange={(e) => setDob(e.target.value)} error={ninErr.dob} />
              {ninErr.form && <p role="alert" className="text-sm text-red-500">{ninErr.form}</p>}
              <SubmitButton loading={ninLoading}>{ninSt === "declined" ? "Resubmit NIN" : "Submit NIN"}</SubmitButton>
            </form>
          </SectionCard>
        )}

        {status?.ninVerified && !status?.bvnVerified && bvnSt === "pending" && <Review title="BVN under review" app={status?.bvnApplication} />}
        {status?.ninVerified && !status?.bvnVerified && bvnSt !== "pending" && (
          <SectionCard icon={CreditCard} tint="text-emerald-500" bg="bg-emerald-500/10" title={bvnSt === "declined" ? "Reapply for BVN verification" : "Verify your BVN"}
            description="Required to unlock Tier 3, the highest account limits.">
            <form onSubmit={onBvn} className="space-y-4" noValidate>
              <Decline app={status?.bvnApplication} />
              {bvnOk && <p role="status" className="text-sm font-semibold text-emerald-500">{bvnOk}</p>}
              <FormField label="BVN" icon={CreditCard} inputMode="numeric" placeholder="12345678901" value={bvn} onChange={(e) => setBvn(digits(e.target.value))} error={bvnErr.bvn} />
              {bvnErr.form && <p role="alert" className="text-sm text-red-500">{bvnErr.form}</p>}
              <SubmitButton loading={bvnLoading}>{bvnSt === "declined" ? "Resubmit BVN" : "Submit BVN"}</SubmitButton>
            </form>
          </SectionCard>
        )}

        {status?.ninVerified && status?.bvnVerified && (
          <SectionCard icon={ShieldCheck} title="You're fully verified" description="You have Tier 3, the highest wallet and transaction limits available.">
            <p className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" /> All limits unlocked</p>
          </SectionCard>
        )}
      </>)}
    </div>
  );
}
