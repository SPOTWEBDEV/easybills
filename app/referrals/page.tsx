"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Copy, Share2, Users, Wallet, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { NotchCard } from "@/components/shared/notch-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatNaira } from "@/lib/utils";
import { referralsApi } from "@/lib/api/referrals";

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["referral-summary"],
    queryFn: referralsApi.summary,
  });
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["referral-history"],
    queryFn: referralsApi.history,
  });

  const referralLink = summary
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${summary.referralCode}`
    : "";

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!referralLink) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Join me on EasyBills", text: "Sign up on EasyBills and we both earn cashback!", url: referralLink });
        return;
      } catch {
        // cancelled — fall through
      }
    }
    handleCopy();
  };

  return (
    <AppShell>
      <PageHeader title="Referrals & Earnings" subtitle="Invite friends, earn cashback together" />

      <div className="space-y-6 px-5 pt-2">
        {summaryLoading || !summary ? (
          <Skeleton className="h-40 w-full rounded-3xl" />
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <NotchCard perforateAt="62%" className="bg-brand-mesh text-white shadow-glow">
              <div className="px-6 pt-6 pb-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Your referral code</p>
                <p className="mt-2 font-display text-3xl font-bold tracking-widest">{summary.referralCode}</p>
                <p className="mt-1 text-xs text-white/60">
                  Share your link — earn {formatNaira(summary.rewardPerReferral)} for every friend who signs up and makes a purchase.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 px-4 pb-5 pt-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 text-sm font-semibold"
                >
                  <Copy className="h-4 w-4" /> {copied ? "Copied!" : "Copy link"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 text-sm font-semibold"
                >
                  <Share2 className="h-4 w-4" /> Invite friends
                </button>
              </div>
            </NotchCard>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3.5 text-center">
            <Users className="mx-auto h-4 w-4 text-brand-600 dark:text-brand-300" />
            <p className="mt-1.5 font-display text-base font-bold">{summary?.totalInvites ?? "—"}</p>
            <p className="text-[10px] text-ink-500 dark:text-paper-200/40">Invites</p>
          </Card>
          <Card className="p-3.5 text-center">
            <Wallet className="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-500" />
            <p className="mt-1.5 font-display text-base font-bold">
              {summary ? formatNaira(summary.totalEarned, { compact: true }) : "—"}
            </p>
            <p className="text-[10px] text-ink-500 dark:text-paper-200/40">Earned</p>
          </Card>
          <Card className="p-3.5 text-center">
            <TrendingUp className="mx-auto h-4 w-4 text-coral-600 dark:text-coral-500" />
            <p className="mt-1.5 font-display text-base font-bold">
              {summary ? formatNaira(summary.rewardPerReferral, { compact: true }) : "—"}
            </p>
            <p className="text-[10px] text-ink-500 dark:text-paper-200/40">Per referral</p>
          </Card>
        </div>

        <div>
          <h2 className="mb-2 px-1 text-sm font-semibold text-ink-600 dark:text-paper-200/60">Referral history</h2>
          <Card className="divide-y divide-ink-100 dark:divide-ink-700 overflow-hidden p-0">
            {historyLoading ? (
              <div className="space-y-2 p-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !history || history.length === 0 ? (
              <p className="p-6 text-center text-sm text-ink-500 dark:text-paper-200/40">
                No referrals yet — share your link to get started.
              </p>
            ) : (
              history.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-ink-500 dark:text-paper-200/40">{formatDate(r.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${r.status === "earned" ? "text-emerald-600 dark:text-emerald-500" : "text-ink-500 dark:text-paper-200/40"}`}>
                      +{formatNaira(r.amount)}
                    </p>
                    <p className="text-[10px] capitalize text-ink-400 dark:text-paper-200/30">{r.status}</p>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}