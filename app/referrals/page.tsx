"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Copy, Share2, Users, Wallet, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { NotchCard } from "@/components/shared/notch-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatNaira } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-auth";

// NOTE: the backend's `referrals` table exists but has no controller yet
// (see easybills-backend README "Not yet implemented as endpoints"), so
// there's no real referral-tracking API to call. The code below is derived
// from the real logged-in user; the history list below it is a preview of
// what this screen will show once that endpoint exists.
const referralHistory = [
  { id: "r1", name: "Chidi O.", status: "earned", amount: 500, date: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "r2", name: "Amara K.", status: "earned", amount: 500, date: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: "r3", name: "Femi A.", status: "pending", amount: 500, date: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: "r4", name: "Ronke S.", status: "earned", amount: 500, date: new Date(Date.now() - 12 * 86400000).toISOString() },
];

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const { data: user } = useCurrentUser();

  const referralCode = user ? `${user.fullName.split(" ")[0].toUpperCase()}500` : "YOU500";
  const referralLink = `https://easybills.example/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
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

  const totalEarned = referralHistory.filter((r) => r.status === "earned").reduce((s, r) => s + r.amount, 0);
  const totalInvites = referralHistory.length;

  return (
    <AppShell>
      <PageHeader title="Referrals & Earnings" subtitle="Invite friends, earn cashback together" />

      <div className="space-y-6 px-5 pt-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <NotchCard perforateAt="62%" className="bg-brand-mesh text-white shadow-glow">
            <div className="px-6 pt-6 pb-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Your referral code</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-widest">{referralCode}</p>
              <p className="mt-1 text-xs text-white/60">
                Share your link — {user?.fullName?.split(" ")[0] ?? "You"} earns ₦500 for every friend who signs up and makes a purchase.
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

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3.5 text-center">
            <Users className="mx-auto h-4 w-4 text-brand-600 dark:text-brand-300" />
            <p className="mt-1.5 font-display text-base font-bold">{totalInvites}</p>
            <p className="text-[10px] text-ink-500 dark:text-paper-200/40">Invites</p>
          </Card>
          <Card className="p-3.5 text-center">
            <Wallet className="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-500" />
            <p className="mt-1.5 font-display text-base font-bold">{formatNaira(totalEarned, { compact: true })}</p>
            <p className="text-[10px] text-ink-500 dark:text-paper-200/40">Earned</p>
          </Card>
          <Card className="p-3.5 text-center">
            <TrendingUp className="mx-auto h-4 w-4 text-coral-600 dark:text-coral-500" />
            <p className="mt-1.5 font-display text-base font-bold">₦500</p>
            <p className="text-[10px] text-ink-500 dark:text-paper-200/40">Per referral</p>
          </Card>
        </div>

        <div>
          <h2 className="mb-2 px-1 text-sm font-semibold text-ink-600 dark:text-paper-200/60">
            Referral history <span className="font-normal text-ink-400 dark:text-paper-200/30">(preview)</span>
          </h2>
          <Card className="divide-y divide-ink-100 dark:divide-ink-700 overflow-hidden p-0">
            {referralHistory.map((r) => (
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
            ))}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
