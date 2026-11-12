"use client";
import { useState } from "react";
import { Check, Copy, Share2, TrendingUp, Users, Wallet } from "lucide-react";
import { SubPageHeader } from "@/components/dashboard/sub-page-header";
import { formatDate } from "@/components/dashboard/transaction-row";
import { useAuth } from "@/components/dashboard/auth-context";
import { useApiData } from "@/hooks/use-api-data";
import { referralsApi } from "@/lib/api/dashboard";
import { cn, formatNaira } from "@/lib/utils";

export default function ReferralsPage() {
  const { user } = useAuth();
  const summary = useApiData(() => referralsApi.summary());
  const history = useApiData(() => referralsApi.history());
  const [copied, setCopied] = useState(false);

  const code = summary.data?.referralCode ?? user?.referralCode ?? "";
  const link = code ? `https://easybills-app.top/r/${code}` : "";
  const items = history.data ?? [];
  const firstName = user?.fullName?.split(" ")[0] ?? "You";

  const onCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };
  const onInvite = async () => {
    const text = `Join me on EasyBills and get instant airtime, data, electricity and more, sorted in seconds. Sign up with my link and we both earn cashback: ${link}`;
    if (navigator.share) { try { await navigator.share({ text }); } catch {} } else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }
  };

  const stats = [
    { icon: Users, value: summary.data?.totalInvites ?? "—", label: "Invites", cls: "" },
    { icon: Wallet, value: summary.data ? formatNaira(summary.data.totalEarned) : "—", label: "Earned", cls: "text-emerald-500" },
    { icon: TrendingUp, value: summary.data ? formatNaira(summary.data.rewardPerReferral) : "—", label: "Per referral", cls: "" },
  ];

  return (
    <div className="space-y-6">
      <SubPageHeader title="Referrals & Earnings" subtitle="Invite friends, earn cashback together" back="/dashboard/profile" />

      <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-[rgb(var(--bg-elevated))] to-emerald-500/10 p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--fg-muted))]">Your referral code</p>
        <p className="mt-2 font-display text-3xl font-bold tracking-widest">{summary.loading ? "…" : code || "—"}</p>
        <p className="mx-auto mt-3 max-w-sm text-sm text-[rgb(var(--fg-muted))]">
          {summary.data ? `Share your link. ${firstName} earns ${formatNaira(summary.data.rewardPerReferral)} for every friend who signs up and makes a purchase.` : "Share your link and earn a reward for every friend who signs up and makes a purchase."}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button onClick={onCopy} disabled={!link} className="inline-flex items-center gap-2 rounded-full border bg-white/5 px-4 py-2.5 text-sm font-bold disabled:opacity-50">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy link"}
          </button>
          <button onClick={onInvite} disabled={!link} className="inline-flex items-center gap-2 rounded-full border bg-white/5 px-4 py-2.5 text-sm font-bold disabled:opacity-50">
            <Share2 className="h-4 w-4" /> Invite friends
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {stats.map(({ icon: Icon, value, label, cls }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-2xl border bg-[rgb(var(--bg-elevated))] py-4">
            <Icon className={cn("h-4 w-4 text-[rgb(var(--fg-muted))]", cls)} />
            <p className={cn("font-display text-sm font-bold sm:text-base", cls)}>{value}</p>
            <p className="text-xs text-[rgb(var(--fg-muted))]">{label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 font-display text-base font-bold">Referral history</h2>
        {history.loading ? <p className="text-sm text-[rgb(var(--fg-muted))]">Loading…</p>
          : items.length === 0 ? <div className="flex flex-col items-center gap-2 py-8 text-[rgb(var(--fg-muted))]"><Users className="h-6 w-6" /><p className="text-sm">No referrals yet</p></div>
          : <div className="space-y-2">{items.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-2xl border bg-[rgb(var(--bg-elevated))] p-4">
              <div><p className="font-bold">{r.name}</p><p className="text-xs text-[rgb(var(--fg-muted))]">{formatDate(r.date)}</p></div>
              <div className="text-right">
                <p className={cn("font-bold", r.amount === null ? "text-[rgb(var(--fg-muted))]" : "text-emerald-500")}>{r.amount !== null ? `+${formatNaira(r.amount)}` : "—"}</p>
                <p className={cn("text-xs", r.status === "pending" ? "text-amber-500" : "text-[rgb(var(--fg-muted))]")}>{r.status === "earned" ? "Earned" : "Pending"}</p>
              </div>
            </div>))}</div>}
      </section>
    </div>
  );
}
